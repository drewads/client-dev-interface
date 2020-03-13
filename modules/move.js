/**
 * This module exports one function, handle, which accepts an
 * HTTP request and a string indicating what the root of the
 * server filesystem is, and it moves a file on the
 * server's filesystem with old path and new path specified
 * in the HTTP request.
 */

'use strict';

const fs = require('fs');
const fsPromises = fs.promises;

const Success = require('./util/Success');
const DevError = require('./util/DevError');
const util = require('./util/util');

/**
 * checkBodyFormat takes a JavaScript object, which is the HTTP request body,
 * as input and returns a boolean. Returns true if body is formatted correctly
 * and false otherwise.
 * 
 * @param {object} body HTTP request body as a JavaScript object
 * @return {boolean} true if body is formatted correctly and false otherwise
 */
const checkBodyFormat = (body) => {
    return body['oldPath'] != undefined && body['newPath'] != undefined;
}

/**
 * moveEntry conducts a filesystem entry move/rename operation with
 * fsPromises.rename(). If a file is already at the new path, this
 * function overwrites it. If a directory is at the new path, this
 * function cannot delete it, so a DevError with code ENOTEMPTY is
 * thrown. If the filesystem entry we are trying to move does not
 * exist, a DevError with code ENOENT is thrown. If some other error
 * occurs, a DevError with code EMOVE is thrown. On success, the
 * returned Promise is resolved with attributes that are
 * recommendations for the server's response to the client.
 * 
 * @param {string} oldPath the filepath to move an entry from
 * @param {string} newPath the filepath to move an entry to
 * @returns {Success} a Success object
 */
const moveEntry = async (oldPath, newPath) => {
    try {
        await fsPromises.rename(oldPath, newPath);
        return new Success.Success(200, {'Content-Type': 'text/plain'}, 'move', 'move successful');
    } catch (error) {
        if (error.code === 'ENOENT') {
            // filesystem entry doesn't exist
            throw new DevError.DevError(DevError.ENOENT, 409, {}, 'move', 'filesystem entry does not exist');
        } else if (error.code === 'ENOTEMPTY') {
            // we are trying to move to an existing directory
            throw new DevError.DevError(DevError.ENOTEMPTY, 409, {}, 'move',
                                        'attempted move to existing nonempty directory');
        } else {
            // if all else fails
            throw new DevError.DevError(DevError.EMOVE, 500, {}, 'move',
                                        'filesystem entry could not be moved');
        }
    }
}

/**
 * handle takes as input an HTTP request and a string that is the
 * root of the server's filesystem, and it returns a Promise. This
 * function is successful if the file described by the body of the
 * HTTP request is moved to the target location described by the
 * body of the HTTP request. Upon success, the value of the Promise
 * is a Success object with attributes that are recommendations for
 * the server's response. Upon failure, a DevError that is specific
 * to the error is thrown.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of the server filesystem
 * @return {Promise} resolved with Success object if move successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    if (request.method.toUpperCase() !== 'PATCH') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'PATCH'}, 'move', 'method not allowed');
    }

    const body = await util.getBodyAsJSON(request) // body is a JavaScript object in the correct case
    .catch(error => {throw new DevError.DevError(DevError.EBODY, 400, {}, 'move', error);});

    // check that the HTTP request body is formatted correctly
    if (!checkBodyFormat(body)) {
        throw new DevError.DevError(DevError.EBODY, 400, {}, 'move',
                                    'request body has incorrect content type/format');
    }

    // won't allow access to an ancestor of the root directory
    if (!util.isDescendantOf(systemRoot + body['oldPath'], systemRoot)
        || !util.isDescendantOf(systemRoot + body['newPath'], systemRoot)) {
        throw new DevError.DevError(DevError.EPATH, 400, {}, 'move', 'invalid filepath');
    }

    try {
        return await moveEntry(systemRoot + body['oldPath'], systemRoot + body['newPath']);
    } catch (error) {
        throw error; // of type DevError
    }
}