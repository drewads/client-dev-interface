'use strict';
const fs = require('fs');
const fsPromises = fs.promises;

const Success = require('./Success');
const DevError = require('./DevError');

const getBody = (request) => {
    return new Promise((resolve, reject) => {
        let body = [];
        
        request.on('data', (chunk) => {
            body.push(chunk);
        });

        request.on('end', () => {
            try {
                body = JSON.parse(Buffer.concat(body).toString());
                resolve(body);
            } catch {
                reject('Delete failed: request body could not be parsed as JSON.');
            }
        });
    });
}

//returns true if body format is okay
const checkBodyFormat = (request, body) => {
    return body['Filepath'] != undefined && body['isDirectory'] != undefined;
}

const checkObjectExists = async (filepath) => {
    try {
        await fsPromises.access(filepath, fs.constants.F_OK);
    } catch (error) {
        throw new DevError.DevError(DevError.ENOENT, 409, {}, 'delete',
                        'Delete failed: system object does not exist.'); // status code 409
    }
}

const deleteDirectory = async (filepath) => {
    try {
        await fsPromises.rmdir(filepath);
    } catch (error) {
        // try to figure out what this error returns
        throw new DevError.DevError(DevError.ERMENT, 500, {}, 'delete',
                                    'Delete failed: directory could not be removed.'); // fsPromises.rmdir error (see docs)
    }
}

const deleteFile = async (filepath) => {
    try {
        await fsPromises.unlink(filepath);
    } catch (error) {
        throw new DevError.DevError(DevError.ERMENT, 500, {}, 'delete',
                                    'Delete failed: file could not be removed.');
    }
}

exports.handle = async (request, systemRoot) => {
    if (request.method === 'DELETE') {

        const body = await getBody(request)
        .catch(error => {throw new DevError.DevError(DevError.EBODY, 400, {}, 'delete', error);});

        if (checkBodyFormat(request, body)) {
            const filepath = systemRoot + body['Filepath'];
            try {
                await checkObjectExists(filepath);
                await (body['isDirectory'] ? deleteDirectory(filepath) : deleteFile(filepath));
                return new Success.Success(200, {}, 'delete',
                    (body['isDirectory'] ? 'Directory' : 'File') + ' successfully deleted.');
            } catch (error) {
                throw error;
            }
        } else {
            throw new DevError.DevError(DevError.EBODY, 400, {}, 'delete',
                                    'Delete failed: request body has incorrect content type/format.');
        }
    } else {
        throw new DevError.DevError(DevError.EMET, 405, {'Allow' : 'DELETE'}, 'delete',
                                    'Delete failed: method not allowed.'); // status code 405
    }
}