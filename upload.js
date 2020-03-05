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
 */
exports.handle = (request, systemRoot, tmpDir) => {
    // HTTP request method must be PUT
    if (request.method !== 'PUT') {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'PUT'}, 'upload', 'method not allowed');
    }

    // handle errors
    let body;
    try {
        body = parseForm(request, tmpDir);
    } catch (error) {
        throw error;
    }
    
    // check that directory path falls in filesystem
    const filepaths = Object.keys(body.files);

    // use a for of here so that we can make this async
    filepaths.forEach(filepath => {
        // use fsPromises.rename instead
        fs.rename(args.files[filepath].path, filepath, (err) => {
            if (err) throw err;
            if (!util.isDescendantOf(filepath, systemRoot)) {
                throw new DevError.DevError(DevError.EPATH, 400, {}, 'delete', 'invalid filepath');
            }
        });
    });
    
    return new Success.Success(200, {'Content-Type': 'text/plain'}, 'upload',
                                'file(s) successfully uploaded');
}