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
        // take dir snapshot
        // arrayofdirents = fsPromises.readdir(path, true); <- this returns fs.Dirent objects
        // arrayofdirents.forEach((dirent) => { arrayToBeReturned.push({'path': dirent.name, 'isDir': dirent.isDirectory()})})
        // return arrayToBeReturned
    } catch (error) {

    }
}