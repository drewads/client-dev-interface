const fs = require('fs');
const fsPromises = fs.promises;

const getBody = (request) => {
    return new Promise(resolve => {
        let body = [];
        
        request.on('data', (chunk) => {
            body.push(chunk);
        });

        request.on('end', () => {
            body = JSON.parse(Buffer.concat(body).toString());
            resolve(body);
        });
    });
}

//returns true if body format is okay
const checkBodyFormat = (body) => {
    return body['Filepath'] != undefined && body['isDirectory'] != undefined;
}

const deleteDirectory = async (filepath) => {
    try {
        await fsPromises.rmdir(filepath);
    } catch (error) {
        throw new Error('Delete failed: directory could not be removed.'); // fsPromises.rmdir error (see docs)
    }
}

const deleteFile = async (filepath) => {
    try {
        await fsPromises.unlink(filepath);
    } catch (error) {
        throw new Error('Delete failed: file could not be removed');
    }
}

const systemObjectNotFound = () => {
    throw new Error('Delete failed: system object does not exist.'); // status code 409
}

exports.handle = async (request, systemRoot) => {
    if (request.method === 'DELETE') {
        const body = await getBody(request);

        if (checkBodyFormat(body)) {
            body['Filepath'] = systemRoot + body['Filepath'];

            try {
                await fsPromises.access(body['Filepath'], fs.constants.F_OK);
            } catch (error) {
                systemObjectNotFound();
            }

            await body['isDirectory'] ? deleteDirectory(systemRoot + Body['Filepath'])
                                            : deleteFile(systemRoot + Body['Filepath']);

            // return Success object with at least recommended status code
        } else {
            throw new Error('Delete failed: request body has incorrect format.'); // status code 400, message 'request body has incorrect format'
        }
    } else {
        throw new Error('Delete failed: method not allowed.'); // status code 405
    }
}