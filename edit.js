/**
 * This module exports one function, handle, which accepts an
 * HTTP request and a string indicating what the root of the
 * server filesystem is, and it sends the contents of a
 * requested file in the HTTP response body. The file is
 * specified in the HTTP request URL query parameters.
 */

'use strict';

const fs = require('fs');
const fsPromises = fs.promises;

const Success = require('./Success');
const DevError = require('./DevError');
const url = require('url');
const mime = require('mime');
const util = require('./util');

/**
 * getFileContents reads the contents of a file and returns a
 * Promise. Upon success, the Promise is resolved with a 
 * Success object containing recommended attributes for the
 * HTTP response. Upon failure, a DevError is thrown with
 * attributes corresponding to the recommended HTTP response.
 * 
 * @param {string} filepath path of the file to be read
 */
const getFileContents = async (filepath) => {
    try {
        const responseBody = await fsPromises.readFile(filepath);
        const responseHeaders = {'Content-Type': mime.getType(filepath)}; // null if file has no extension
        return new Success.Success(200, responseHeaders, 'edit', responseBody);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // doesn't exist
            throw new DevError.DevError(DevError.ENOENT, 409, {}, 'edit',
                                        'file does not exist');
        } else if (error.code === 'EISDIR') {
            // is a directory, not a regular file
            throw new DevError.DevError(DevError.EISDIR, 409, {}, 'edit',
                                        'filesystem entry is a directory');
        } else {
            // catch all; should never happen
            throw new DevError.DevError(DevError.EREAD, 500, {}, 'edit',
                                        'file could not be read');
        }
    }
}

/**
 * handle takes as input an HTTP request and a string that is the
 * root of the server's filesystem, and it returns a Promise. This
 * function is successful if the contents of the file specified by
 * the HTTP request are returned in the response body. Really, this
 * is responding to a normal GET request. Upon success, the value of
 * the Promise is a Success object with attributes that are
 * recommendations for the server's response. Upon failure, a DevError
 * that is specific to the error is thrown.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of server filesystem
 * @return {Promise} resolved with Success object if operation successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    // check that HTTP request method is GET
    if (request.method !== 'GET') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow': 'GET'}, 'edit', 'method not allowed');
    }

    const query = url.parse(request.url, true).query; // URL query parameters
    
    // check that query parameters have correct format
    if (query['Filepath'] === undefined) {
        throw new DevError.DevError(DevError.EQUERY, 400, {}, 'edit', 'incorrect querystring');
    }

    // won't allow access of an ancestor of the root directory
    if (!util.isDescendantOf(systemRoot + query['Filepath'], systemRoot)) {
        throw new DevError.DevError(DevError.EPATH, 400, {}, 'edit', 'invalid filepath');
    }

    try {
        return await getFileContents(systemRoot + query['Filepath']);
    } catch (error) {
        throw error;
    }
}