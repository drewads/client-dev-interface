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
 * 
 * @param {IncomingMessage} request 
 * @param {string} tmpDir path to the directory used for temporary files
 * @return {Promise}
 */
const parseForm = async (request, tmpDir) => {
    const formParser = new formidable.IncomingForm({multiples: true, uploadDir: tmpDir});
    return new Promise((resolve, reject) => {
        formParser.parse(request, (err, fields, files) => {
            if (err) {
                console.log(err);
                reject(new DevError.DevError(DevError.EBODY, 400, {}, 'delete',
                                            'request body has incorrect format'));
            } else {
                resolve({fields : fields, files : files});
            }
        });
    });
}

/**
 * 
 * @param {*} files <-- figure out what type this is
 * @param {*} filepaths 
 */
const getFilepaths = (files, filepaths) => {
    const locations = {};
    for (const filepath of filepaths) {
        locations[filepath] = files[filepath].path;
    }
    return locations;
}

/**
 * 
 * @param {*} files 
 * @param {*} systemRoot 
 */
const renameFiles = async (files, systemRoot) => {
    const filepaths = Object.keys(files);
    const locations = getFilepaths(files, filepaths); // may need to be mutable variable (let)

    for (const filepath of filepaths) {
        if (!util.isDescendantOf(systemRoot + filepath, systemRoot)) {
            throw new DevError.DevError(DevError.EPATH, 400, {}, 'upload', 'invalid filepath');
        }

        try {
            await fsPromises.rename(files[filepath].path, systemRoot + filepath);
        } catch (error) {
            // the message of this error is unique - it is a JSON stringified object of file locations
            throw new DevError.DevError(DevError.EMOVE, 500, {}, 'upload', JSON.stringify(locations));
        }

        locations[filepath] = systemRoot + filepath;
    }
    return new Success.Success(200, {'Content-Type': 'text/plain'}, 'upload',
                                'file(s) successfully uploaded');
}

/**
 * 
 */
exports.handle = (request, systemRoot, tmpDir) => {
    // HTTP request method must be PUT
    if (request.method !== 'PUT') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'PUT'}, 'upload', 'method not allowed');
    }

    let body; // parsed multipart/form-data
    try {
        body = parseForm(request, tmpDir);
    } catch (error) {
        throw error;
    }

    try {
        // move uploaded files from temporary directory
        return await renameFiles(body.files, systemRoot);
    } catch (error) {
        throw error;
    }
}