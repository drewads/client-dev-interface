/**
* This module exports one function, handle, which accepts an
* HTTP request and a string indicating what the root of the
* server filesystem is, and it saves an uploaded file on the
* server's filesystem.
*/

'use strict';

const fs = require('fs');
const fsPromises = fs.promises;

const Success = require('./Success');
const DevError = require('./DevError');
const util = require('./util');
const formidable = require('formidable');

/**
 * 
 */
exports.handle = (request, response, systemRoot) => {
    // check method is PUT
    // use formidable to parse
    // handle errors
    // check that directory path falls in filesystem
    // see if maybe we can check stuff before saving files to system
}