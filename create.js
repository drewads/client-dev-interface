/**
 * This module exports one function, handle, which accepts an
 * HTTP request and a string indicating what the root of the
 * server filesystem is, and it creates a new file on the
 * server's filesystem with name and location specified by the
 * HTTP request.
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
    return body['Filepath'] != undefined && body['isDirectory'] != undefined;
}

/**
 * createDirectory creates a new directory at the given filepath. createDirectory
 * returns a Success object on success and throws a DevError on failure, which
 * includes the case in which the directory already exists.
 * 
 * @param {string} path the filesystem path of the directory to be created
 * @return {Promise} on success: resolved with Success object. on failure: rejected with a DevError.
 */
const createDirectory = async (path) => {
    try {
        await fsPromises.mkdir(path);
    } catch (error) {
        // handle the case of already existing path differently from other errors
        if (error.code === 'EEXIST') {
            throw new DevError.DevError(DevError.EENTEX, 409, {}, 'create',
                                        'Directory already exists in filesystem.');
        } else {
            throw new DevError.DevError(DevError.ECRENT, 500, {}, 'create',
                                    'Server was unable to create directory.');
        }
    }

    return new Success.Success(201, {'Location': path}, 'create',
                                    'Directory successfully created.');
}

/**
 * createFile creates a new directory at the given filepath. createFile
 * returns a Success object on success and throws a DevError on failure, which
 * includes the case in which the file already exists.
 * 
 * @param {string} path the filepath of the file to be created
 * @return {Promise} on success: resolved with Success object. on failure: rejected with a DevError.
 */
const createFile = async (path) => {
    let filehandle;
    try {
        // 'ax' throws error if path already exists
        filehandle = await fsPromises.open(path, 'ax');
    } catch (error) {
        // handle the case of already existing path differently from other errors
        if (error.code === 'EEXIST') {
            throw new DevError.DevError(DevError.EENTEX, 409, {}, 'create',
                                        'File already exists in filesystem.');
        } else {
            throw new DevError.DevError(DevError.ECRENT, 500, {}, 'create',
                                    'Server was unable to create file.');
        }
    } try {
        // need to close opened file
        if (filehandle !== undefined) {
            await filehandle.close();
        }
    } catch (error) {
        // this error probably shouldn't ever occur
        throw new DevError.DevError(DevError.ECLOSE, 500, {}, 'create',
                                    'Server was unable to close opened file.');
    }

    return new Success.Success(201, {'Location': path}, 'create', 'File successfully created.');
}

/**
 * handle takes as input an HTTP request and a string that is the
 * root of the server's filesystem, and it returns a Promise. This
 * function is successful if the file described by the body of the
 * HTTP request is created. Upon success, the value of the Promise
 * is a Success object with attributes that are recommendations for
 * the server's response. Upon failure, a DevError that is specific
 * to the error is thrown.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of the server filesystem
 * @return {Promise} resolved with Success object if create successful, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    if (request.method !== 'PUT') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'PUT'}, 'create',
                                    'Create failed: method not allowed.');
    }

    const body = await util.getBodyAsJSON(request) // body is a JavaScript object in the correct case
    .catch(error => {throw new DevError.DevError(DevError.EBODY, 400, {}, 'create', error);});

    // checks that the HTTP request body is formatted correctly
    if (!checkBodyFormat(body)) {
        throw new DevError.DevError(DevError.EBODY, 400, {}, 'create',
                                    'Create failed: request body has incorrect content type/format.');
    }

    try {
        // create file or directory depending on value of isDir boolean
        return await (body['isDirectory'] ? createDirectory(systemRoot + body['Filepath'])
                                            : createFile(systemRoot + body['Filepath']));
    } catch (error) {
        throw error; // something went wrong during create
    }
}