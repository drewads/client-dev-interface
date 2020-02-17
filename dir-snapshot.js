/**
 * This module exports one function, handle, which accepts an
 * HTTP request and a string indicating what the root of the
 * server filesystem is, and it takes a snapshot of a directory
 * on the server's filesystem. The directory is specified
 * in the HTTP request body.
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
    return body['Directory'] != undefined;
}

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
        const dirEntries = await fsPromises.readdir(dirPath, true);
        
        let responseBody; // an array of JavaScript objects as seen below
        // parse array of fs.Dirent objects into array of JavaScript objects
        dirEntries.forEach((dirEntry) => {
            responseBody.push({'path': dirEntry.name, 'isDir': dirEntry.isDirectory()});
        });

        return new Success.Success(200, {'Content-Type': 'application/json'}, 'dir-snapshot',
                                JSON.stringify(responseBody));
    } catch (error) {
        console.log(error);
        throw new DevError.DevError(DevError.ENOENT, 409, {}, 'dir-snapshot',
                                    'directory does not exist');
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
    if (request.method !== 'GET') {
        throw new DevError.DevError(DevError.EMET, 405, {}, 'dir-snapshot',
                                    'method not allowed')
    }

    const body = await util.getBodyAsJSON(request) // body is a JavaScript object in the correct case
    .catch(error => {throw new DevError.DevError(DevError.EBODY, 400, {}, 'dir-snapshot',
                                                error);});

    // check that the HTTP request body is formatted correctly
    if (!checkBodyFormat(body)) {
        throw new DevError.DevError(DevError.EBODY, 400, {}, 'dir-snapshot',
                                    'request body has incorrect format');
    }

    try {
        return await takeSnapshot(systemRoot + body['Directory']);
    } catch (error) {
        throw error;
    }
}