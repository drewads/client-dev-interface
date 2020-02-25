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
exports.handle = (request, systemRoot) => {
    // USE THE EDIT DEV MODULE AS A GUIDE FOR THIS ONE

    // check that method is PUT

    // parse url query parameters to get Filepath parameter. make sure Filepath parameter exists.

    // check to make sure location we are saving to doesn't require access to an ancestor of the root

    // MAKE SURE TO CHECK THAT FILE TYPE MATCHES CONTENT-TYPE HEADER

    // use fsPromises.writeFile to write the HTTP request body to the specified file
}