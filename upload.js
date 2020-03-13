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
 * parseForm parses the HTTP request body as multipart/form-data,
 * and returns a Promise that is resolved upon success. The value
 * of the Promise upon success is a javascript object with keys
 * fields and files, with values that are the fields and files
 * from the multipart/form-data, respectively. On a parsing error,
 * the Promise is rejected with a DevError.
 * 
 * @param {IncomingMessage} request the HTTP request
 * @param {string} tmpDir path to the directory used for temporary files
 * @return {Promise} resolved if form was parsed, rejected with DevError if error occurred
 */
const parseForm = async (request, tmpDir) => {
    const formParser = new formidable.IncomingForm({multiples: true, uploadDir: tmpDir});
    return new Promise((resolve, reject) => {
        formParser.parse(request, (error, fields, files) => {
            if (error) {
                reject(new DevError.DevError(DevError.EBODY, 400, {}, 'delete',
                                            'request body has incorrect format'));
            } else {
                resolve({fields : fields, files : files});
            }
        });
    });
}

/**
 * getFilepaths returns a javascript object with keys that are
 * the filepaths input as arguments to this function and with
 * values that are the files input as arguments to this function.
 * 
 * @param {Files} files
 * @param {string[]} filepaths 
 */
const getFilepaths = (files, filepaths) => {
    const locations = {};
    for (const filepath of filepaths) {
        locations[filepath] = files[filepath].path;
    }
    return locations;
}

/**
 * renameFiles renames the files passed as input to move them from the temporary
 * directory to their final location. It returns a Promise which is resolved with
 * a Success object upon Success and a DevError with message containing a JSON-
 * stringified object of file locations on failure.
 *  
 * @param {Files} files 
 * @param {string} systemRoot path to the root directory
 * @return {Promise} a Promise that is resolved with a success object on success else rejected with DevError
 */
const renameFiles = async (files, systemRoot) => {
    const filepaths = Object.keys(files);
    const locations = getFilepaths(files, filepaths); // may need to be mutable variable (let)

    for (const filepath of filepaths) {
        if (!util.isDescendantOf(systemRoot + filepath, systemRoot)) {
            // the message of this error is a JSON stringified object of file locations
            throw new DevError.DevError(DevError.EPATH, 400, {}, 'upload', JSON.stringify(locations));
        }

        try {
            await fsPromises.rename(files[filepath].path, systemRoot + filepath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // filesystem entry doesn't exist
                // the message of this error is a JSON stringified object of file locations
                throw new DevError.DevError(DevError.ENOENT, 409, {}, 'upload', JSON.stringify(locations));
            }
            // if all else fails
            // the message of this error is a JSON stringified object of file locations
            throw new DevError.DevError(DevError.EMOVE, 500, {}, 'upload', JSON.stringify(locations));
        }

        locations[filepath] = systemRoot + filepath;
    }
    return new Success.Success(200, {'Content-Type': 'text/plain'}, 'upload',
                                'file(s) successfully uploaded');
}

/**
 * handle carries out the upload operation given an HTTP request,
 * the filepath to the root directory, and the directory in which
 * to store temporary files. It returns a Promise that is resolved
 * with a Success object upon success and is rejected with a DevError
 * on failure. Some failures may cause files to be saved to the
 * temporary directory but not moved to their desired location. In
 * these cases, handle should reject with a DevError that has
 * message field containing a JSON-stringified object with all of the
 * locations of the uploaded files.
 * 
 * The following errors cause such a thing to happen:
 * EPATH
 * EMOVE
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot filepath of the root directory
 * @param {string} tmpDir filepath of the directory to put temporary files
 * @return {Promise} a Promise that is resolved with a success object on success else rejected with DevError
 */
exports.handle = async (request, systemRoot, tmpDir) => {
    // HTTP request method must be PUT
    if (request.method.toUpperCase() !== 'PUT') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'PUT'}, 'upload', 'method not allowed');
    }

    let body; // parsed multipart/form-data
    try {
        body = await parseForm(request, tmpDir);
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