/**
 * This module exports one function, handle, which accepts an
 * HTTP request and a string indicating what the root of the
 * server filesystem is, and it ***........
 */

'use strict';

const fs = require('fs');
const fsPromises = fs.promises;

const Success = require('./Success');
const DevError = require('./DevError');
const url = require('url');
const util = require('./util');

/**
 * saveFile writes the string data given as the body parameter to the
 * file at the filepath specified by the filepath parameter. This returns
 * a Promise. A DevError is thrown when an error occurs. The possible
 * errors thrown are EISDIR and EWRITE.
 * 
 * Data must be UTF-8 encoded.
 * 
 * @param {string} filepath absolute path to the file to write to
 * @param {string} body the string data to write
 * @returns {Promise} Promise resolved on success, rejected upon error
 */
const saveFile = async (filepath, body) => {
    // use fsPromises.writeFile to write the HTTP request body to the specified file
    try {
        await fsPromises.writeFile(filepath, body);
        return new Success.Success(200, {'Content-Type': 'text/plain'}, 'save', 'file successfully saved');
    } catch (error) {
        if (error.code === 'EISDIR') {
            // is a directory, not a regular file
            throw new DevError.DevError(DevError.EISDIR, 409, {}, 'save',
                                        'filesystem entry is a directory');
        } else {
            // catch all; should never happen
            throw new DevError.DevError(DevError.EWRITE, 500, {}, 'save', 'file could not be saved');
        }
    }
}

/**
 * handle takes as input an HTTP request and a string that is the
 * root of the server's filesystem, and it returns a Promise. This
 * function is successful if *****..... Upon success, the value of
 * the Promise is a Success object with attributes that are
 * recommendations for the server's response. Upon failure, a DevError
 * that is specific to the error is thrown.
 * 
 * This function does **not** check to make sure the HTTP request
 * `Content-Type` header matches the given file's extension.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of server filesystem
 * @return {Promise} resolved with Success object if operation successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    // check that HTTP request method is PUT
    if (request.method !== 'PUT') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow': 'PUT'}, 'save', 'method not allowed');
    }

    const query = url.parse(request.url, true).query; // URL query parameters
    // check that query parameters have correct format
    if (query['Filepath'] === undefined) {
        throw new DevError.DevError(DevError.EQUERY, 400, {}, 'save', 'incorrect querystring');
    }

    const filepath = systemRoot + query['Filepath'];
    // won't allow access to an ancestor of the root directory
    if (!util.isDescendantOf(filepath, systemRoot)) {
        throw new DevError.DevError(DevError.EPATH, 400, {}, 'save', 'invalid filepath');
    }

    try {
        // saves HTTP request body to file at the location specified by filepath
        return await saveFile(filepath, await util.getBody(request));
    } catch (error) {
        throw error;
    }
}