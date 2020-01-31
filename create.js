const fs = require('fs');

const checkBodyFormat = (body) => {
    if (body['Directory'] != undefined && body['isDirectory'] != undefined) {
        if (!body['isDirectory'] && body['Filename'] == undefined) {
            return false;
        } else return true;
    } else return false;
}

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
                fs.access(location, fs.constants.F_OK, (err) => {
                    if (!err) {
                        // make page to throw up maybe? prob not
                        response.writeHead(409, {'Content-Type': 'text/html'});
                        response.write('File already exists.');
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
                                            response.writeHead(200, {'Content-Type': 'text/html'});
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
                                    response.writeHead(200, {'Content-Type': 'text/html'});
                                    response.write('Success!');
                                    response.end();
                                }
                            });
                        }
                    }
                })
                /*
                console.log(request.method + ', ' + request.url);
                console.log('Directory: ' + body['Directory']);
                console.log('Filename: ' + body['Filename']);
                console.log('Is Directory: ' + body['isDirectory']);
                console.log();
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.write('Data received.\n');
                response.write(request.method + ', ' + request.url + ', ' + JSON.stringify(body));
                response.end();
                */
            }
        });
    } else {
        // make error page
        response.writeHead(405, {'Content-Type': 'text/html', 'Allow': 'PUT'});
        response.write('Error 405: Method Not Allowed');
        response.end();
    }
}