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

exports.handle = async (request, systemRoot) => {
    // check method is GET

    // get body as JSON

    // check body format

    // take dir snapshot
    // arrayofdirents = fsPromises.readdir(path, true); <- this returns fs.Dirent objects
    // arrayofdirents.forEach((dirent) => { arrayToBeReturned.push({'path': dirent.name, 'isDir': dirent.isDirectory()})})
    // return arrayToBeReturned
}