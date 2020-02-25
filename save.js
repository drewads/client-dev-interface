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
const mime = require('mime');
const util = require('./util');

/**
 * handle takes as input an HTTP request and a string that is the
 * root of the server's filesystem, and it returns a Promise. This
 * function is successful if *****..... Upon success, the value of
 * the Promise is a Success object with attributes that are
 * recommendations for the server's response. Upon failure, a DevError
 * that is specific to the error is thrown.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of server filesystem
 * @return {Promise} resolved with Success object if operation successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    // USE THE EDIT DEV MODULE AS A GUIDE FOR THIS ONE

    // check that HTTP request method is PUT
    if (request.method !== 'PUT') {
        throw new DevError.DevError(DevError.EMET, 405, {}, 'save', 'method not allowed');
    }

    const query = url.parse(request.url, true).query; // URL query parameters
    // check that query parameters have correct format
    if (query['Filepath'] === undefined) {
        throw new DevError.DevError(DevError.EQUERY, 400, {}, 'save', 'incorrect querystring');
    }

    // won't allow access of an ancestor of the root directory
    if (!util.isDescendantOf(systemRoot + query['Filepath'], systemRoot)) {
        throw new DevError.DevError(DevError.EPATH, 400, {}, 'save', 'invalid filepath');
    }

    // MAKE SURE TO CHECK THAT FILE TYPE MATCHES CONTENT-TYPE HEADER
    // what if file has no extension? probably wants undefined content-type?
    // check what happens in edit dev module when file has no extension

    // get body with util.getBody
    const body = await util.getBody(request);

    // use fsPromises.writeFile to write the HTTP request body to the specified file
}