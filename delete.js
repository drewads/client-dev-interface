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

const deleteSystemObject = (request, response, systemRoot) => {
    // TODO: implement this. info on github issue
}

const systemObjectNotFound = (response) => {
    // make page to throw up maybe? prob not
    response.writeHead(409, {'Content-Type': 'text/html'});
    // delete failed because..
    response.write((body['isDirectory'] ? 'Directory' : 'File')
                    + ' does not exist.');
    response.end();
}

exports.handle = (request, response, systemRoot) => {
    if (request.method === 'DELETE') {
        const body = getBody(request);

        if (!checkBodyFormat(body)) {
            response.writeHead(400, 'Request body has incorrect format.');
            response.end();
        } else {
            fsPromises.access(body['Filepath'], fs.constants.F_OK)
            .then(() => deleteSystemObject(request, response, systemRoot)) // maybe separate into delete file and dir
            .catch(error => systemObjectNotFound(response));
        }
    } else {
        // make error page
        response.writeHead(405, {'Content-Type': 'text/html', 'Allow': 'DELETE'});
        response.write('Error 405: Method Not Allowed');
        response.end();
    }
}