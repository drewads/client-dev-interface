/**
* This module exports one function, handle, which accepts an
* HTTP request and a string indicating what the root of the
* server filesystem is, and it checks to see if the file on the
* server's filesystem that is specified in the HTTP request
* exists.
*/

'use strict';

const fs = require('fs');
const fsPromises = fs.promises;
const url = require('url');

const Success = require('./Success');
const DevError = require('./DevError');
const util = require('./util');

/**
 * handle takes as input an HTTP request and a string that is the
 * root of the server's filesystem, and it returns a Promise. This
 * function is successful if the file exists. Upon success, the
 * value of the Promise is a Success object with attributes that
 * are recommendations for the server's response. Upon failure, a
 * DevError that is specific to the error is thrown.
 * 
 * If the file doesn't exist, the DevError has status code 404.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of the server filesystem
 * @return {Promise} resolved with Success object if operation successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    // HTTP request method must be GET
    if (request.method !== 'GET') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'GET'}, 'exists', 'method not allowed');
    }

    const query = url.parse(request.url, true).query; // URL query parameters

    // check that query parameters have correct format
    if (query['Filepath'] === undefined) {
        throw new DevError.DevError(DevError.EQUERY, 400, {}, 'exists', 'incorrect querystring');
    }

    const filepath = systemRoot + query['Filepath'];

    // won't allow access to an ancestor of the root directory
    if (!util.isDescendantOf(filepath, systemRoot)) {
        throw new DevError.DevError(DevError.EPATH, 400, {}, 'exists', 'invalid filepath');
    }
    
    try {
        await fsPromises.access(filepath);
        return new Success.Success(200, {'Content-Type': 'text/plain'}, 'exists',
                                    'filesystem entry exists');
    } catch {
        throw new DevError.DevError(DevError.ENOENT, 404, {'Content-Type': 'text/plain'}, 'exists',
                                    'filesystem entry does not exist');
    }
}