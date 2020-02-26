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
    // HTTP request method must be GET
    if (request.method !== 'GET') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'GET'}, 'exists',
                                    'method not allowed');
    }

    // get query parameters and check that they are good

    // won't allow access of an ancestor of the root directory
    /*if (!util.isDescendantOf(filepath, systemRoot)) {
        throw new DevError.DevError(DevError.EPATH, 400, {}, 'delete', 'invalid filepath');
    }*/
    
    // use fsPromises.access. 
}