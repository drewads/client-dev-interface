/**
 * This module exports one function, handle, which accepts an
 * HTTP request and a string indicating what the root of the
 * server filesystem is, and it takes a snapshot of a directory
 * on the server's filesystem. The directory is specified
 * in the HTTP request URL query parameters.
 */

'use strict';

const fs = require('fs');
const fsPromises = fs.promises;
const url = require('url');

const Success = require('./util/Success');
const DevError = require('./util/DevError');
const util = require('./util/util');

/**
 * takeSnapshot takes one parameter - a string that is the
 * path to a directory. It returns a Promise, which is resolved
 * upon success with a Success object and rejected upon
 * failure with a DevError. The body attribute of the Success
 * object contains the JSON-stringified recommended HTTP
 * response body.
 * 
 * @param {string} dirPath path to directory snapshot is of
 * @return {Promise} resolved with Success object on success, else rejected with DevError
 */
const takeSnapshot = async (dirPath) => {
    try {
        // dirEntries is an array of fs.Dirent objects
        const dirEntries = await fsPromises.readdir(dirPath, {'withFileTypes': true});

        let responseBody = []; // an array of JavaScript objects
        // parse array of fs.Dirent objects into array of JavaScript objects
        dirEntries.forEach((dirEntry) => {
            responseBody.push({'name': dirEntry.name, 'isDir': dirEntry.isDirectory()});
        });

        return new Success.Success(200, {'Content-Type': 'application/json'}, 'dir-snapshot',
                                JSON.stringify(responseBody));
    } catch (error) {
        if (error.code === 'ENOTDIR') {
            // not a directory
            throw new DevError.DevError(DevError.ENOTDIR, 409, {}, 'dir-snapshot',
                                    'filesystem entry is not a directory');
        } else if (error.code === 'ENOENT') {
            // doesn't exist
            throw new DevError.DevError(DevError.ENOENT, 409, {}, 'dir-snapshot',
                                    'directory does not exist');
        } else {
            // catch all; should never happen
            throw new DevError.DevError(DevError.EREAD, 500, {}, 'dir-snapshot',
                                    'directory could not be read');
        }
    }
}

/**
 * handle takes as input an HTTP request and a string that is the
 * root of the server's filesystem, and it returns a Promise. This
 * function is successful if an array is created containing
 * JavaScript objects that describe the filesystem entries specified
 * by the HTTP request. Upon success, the value of the Promise is a
 * Success object with attributes that are recommendations for the
 * server's response. Upon failure, a DevError that is specific to
 * the error is thrown.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of server filesystem
 * @return {Promise} resolved with Success object if operation successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    // check that HTTP request method is GET
    if (request.method.toUpperCase() !== 'GET') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow': 'GET'}, 'dir-snapshot',
                                    'method not allowed');
    }

    const query = url.parse(request.url, true).query;
    
    if (query['Directory'] === undefined) {
        throw new DevError.DevError(DevError.EQUERY, 400, {}, 'dir-snapshot', 'incorrect querystring');
    }

    // won't allow access to an ancestor of the root directory
    if (!util.isDescendantOf(systemRoot + query['Directory'], systemRoot)) {
        throw new DevError.DevError(DevError.EPATH, 400, {}, 'dir-snapshot', 'invalid filepath');
    }

    try {
        return await takeSnapshot(systemRoot + query['Directory']);
    } catch (error) {
        throw error;
    }
}