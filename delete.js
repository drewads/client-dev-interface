/**
* This module exports one function, handle, which accepts an
* HTTP request and a string indicating what the root of the
* server filesystem is, and it deletes the file on the
* server's filesystem that is specified in the HTTP request.
*/

'use strict';

const fs = require('fs');
const fsPromises = fs.promises;

const Success = require('./Success');
const DevError = require('./DevError');
const util = require('./util');

/**
 * checkBodyFormat takes a JavaScript object, which is the HTTP request body,
 * as input and returns a boolean. Returns true if body is formatted correctly
 * and false otherwise.
 * 
 * @param {object} body HTTP request body as a JavaScript object
 * @return {boolean} true if body is formatted correctly and false otherwise
 */
const checkBodyFormat = (body) => {
    return body['Filepath'] != undefined && body['isDirectory'] != undefined;
}

/**
 * deleteObject takes as input a filepath and a boolean indicating whether
 * the filesystem entry is a directory or not, and it deletes the given
 * filesystem entry, using the correct method depending on whether the
 * entry is a directory or not. A Promise is returned. If the fileystem
 * entry does not exist, a DevError is thrown indicating so, and if the
 * filesystem entry is a nonempty directory, a DevError is thrown
 * indicating so. If another error occurs and the entry could not be
 * deleted, a general server DevError is thrown.
 * 
 * @param {string} filepath path to object to delete
 * @param {boolean} isDir true if object is directory, false otherwise
 * @return {Promise} resolved if delete successful, DevError thrown otherwise
 */
const deleteObject = async (filepath, isDir) => {
    try {
        // either delete directory or file
        await (isDir ? fsPromises.rmdir(filepath) : fsPromises.unlink(filepath));
    } catch (error) {
        if (error.code === 'ENOENT') {
            // filesystem entry doesn't exist
            throw new DevError.DevError(DevError.ENOENT, 409, {}, 'delete',
                                        'Delete failed: system object does not exist.');
        } else if (error.code === 'ENOTEMPTY') {
            // directory isn't empty
            throw new DevError.DevError(DevError.ENOTEMPTY, 409, {}, 'delete',
                                        'Delete failed: directory not empty.');
        } else {
            // otherwise, general server error
            throw new DevError.DevError(DevError.ERMENT, 500, {}, 'delete',
                'Delete failed: ' + (isDir ? 'directory' : 'file') + ' could not be removed.');
        }
    }
}

/**
 * handle takes as input an HTTP request and a string that is the
 * root of the server's filesystem, and it returns a Promise. This
 * function is successful if the file described by the body of the
 * HTTP request is deleted. Upon success, the value of the Promise
 * is a Success object with attributes that are recommendations for
 * the server's response. Upon failure, a DevError that is specific
 * to the error is thrown.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of the server filesystem
 * @return {Promise} resolved with Success object if delete successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    // HTTP request method must be DELETE
    if (request.method !== 'DELETE') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'DELETE'}, 'delete',
                                    'Delete failed: method not allowed.');
    }

    const body = await util.getBodyAsJSON(request) // body is a JavaScript object in the correct case
    .catch(error => {throw new DevError.DevError(DevError.EBODY, 400, {}, 'delete',
                                                'Delete failed: ' + error);});
    
    // checks that the HTTP request body is formatted correctly
    if (!checkBodyFormat(body)) {
        throw new DevError.DevError(DevError.EBODY, 400, {}, 'delete',
                                    'Delete failed: request body has incorrect content type/format.');
    }

    const filepath = systemRoot + body['Filepath']; // absolute filepath to filesystem object

    // won't allow access of an ancestor of the root directory
    if (!util.isDescendantOf(filepath, systemRoot)) {
        throw new DevError.DevError(DevError.EPATH, 400, {}, 'delete', 'Delete failed: invalid filepath.');
    }

    try {
        await deleteObject(filepath, body['isDirectory']);
        return new Success.Success(200, {'Content-Type': 'text/plain'}, 'delete',
            (body['isDirectory'] ? 'Directory' : 'File') + ' successfully deleted.');
    } catch (error) {
        throw error; // this is a DevError returned by deleteObject
    }
}