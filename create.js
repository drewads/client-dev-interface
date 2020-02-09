'use strict';
const fs = require('fs');

// returns true if body format is okay
const checkBodyFormat = (body) => {
    if (body['Directory'] != undefined && body['isDirectory'] != undefined) {
        if (!body['isDirectory'] && body['Filename'] == undefined) {
            return false;
        } else return true;
    } else return false;
}

/*
Use promises instead of callbacks.
*/

// maybe make create just take file / directory name and isDirectory.

// clean this function up, comment, and break down into smaller functions
exports.handle = (request, response, systemRoot) => {
    if (request.method === "PUT") {
        let body = [];
        
        request.on('data', (chunk) => {
            body.push(chunk);
        });

        request.on('end', () => {
            body = JSON.parse(Buffer.concat(body).toString());

            if (!checkBodyFormat(body)) {
                response.writeHead(400, 'Request body has incorrect format.');
                response.end();
            } else {
                const dirPathRegex = /\/$/;     // file path ends in /

                const location = body['Directory']
                                + (dirPathRegex.test(body['Directory']) ? '' : '/')
                                + (body['isDirectory'] ? '' : body['Filename']);

                // use fs access to see if file already exists
                fs.access(systemRoot + location, fs.constants.F_OK, (err) => {
                    if (!err) {
                        // make page to throw up maybe? prob not
                        response.writeHead(409, {'Content-Type': 'text/html'});
                        response.write((body['isDirectory'] ? 'Directory' : 'File')
                                        + ' already exists in filesystem.');
                        response.end();
                    } else {
                        if (!body['isDirectory']) {
                            fs.open(systemRoot + location, 'a', (err, fd) => {
                                if (err) {
                                    // create page to throw?
                                    response.writeHead(500, {'Content-Type': 'text/html'});
                                    response.write('Server was unable to open file.');
                                    response.end();
                                } else {
                                    fs.close(fd, (err) => {
                                        if (err) {
                                            // create page to throw?
                                            response.writeHead(500, {'Content-Type': 'text/html'});
                                            response.write('Server was unable to close file.');
                                            response.end();
                                        } else {
                                            // change this at some point
                                            response.writeHead(201, {'Content-Type': 'text/html', 'Location': location});
                                            response.write('Success!');
                                            response.end();
                                        }
                                    });
                                }
                            });
                        } else {
                            fs.mkdir(systemRoot + location, (err) => {
                                if (err) {
                                    // create page to throw?
                                    response.writeHead(500, {'Content-Type': 'text/html'});
                                    response.write('Server was unable to create directory.');
                                    response.end();
                                } else {
                                    // change this at some point
                                    response.writeHead(201, {'Content-Type': 'text/html', 'Location': location});
                                    response.write('Success!');
                                    response.end();
                                }
                            });
                        }
                    }
                })
            }
        });
    } else {
        // make error page
        response.writeHead(405, {'Content-Type': 'text/html', 'Allow': 'PUT'});
        response.write('Error 405: Method Not Allowed');
        response.end();
    }
}