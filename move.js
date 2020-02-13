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

const Success = require('./Success');
const DevError = require('./DevError');
const util = require('./util');

/**
 * checkBodyFormat takes a JavaScript object, which is the HTTP request body,
 * as input and returns a boolean. Returns true if body is formatted correctly
 * and false otherwise.
 * 
 * @param {IncomingMessage} body HTTP request
 * @return {boolean} true if body is formatted correctly and false otherwise
 */
const checkBodyFormat = (body) => {
    return ;
}

// if a file is already at new path, it overwrites it
// if a directory is at new path, we throw an error (look at the error thrown by fsPromises.rename for this)

/**
 * 
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of the server filesystem
 * @return {Promise} resolved with Success object if move successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    
}