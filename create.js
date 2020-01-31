const fs = require('fs');

exports.handle = (request, response, systemRoot) => {
    if (request.method === "PUT") {
        let body = [];
        
        request.on('data', (chunk) => {
            body.push(chunk);
        });

        request.on('end', () => {
            body = JSON.parse(Buffer.concat(body).toString());

            // check if body is correct format

            const dirPathRegex = /\/$/;     // file path ends in /

            const location = body['Directory']
                            + dirPathRegex.test(body['Directory']) ? '' : '/'
                            + body['isDirectory'] ? '' : body['Filename'];

            // use fs access to see if file already exists

            if (body['Type'] && body['Type'] === 'File') {
                fs.open(systemRoot + location, (err, fd) => {
                    // handle error here
                    // call fs close
                });
            }

            console.log(request.method + ', ' + request.url);
            console.log('Directory: ' + body['Directory']);
            console.log('Filename: ' + body['Filename']);
            console.log('Type: ' + body['Type']);
            console.log();
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.write('Data received.\n');
            response.write(request.method + ', ' + request.url + ', ' + JSON.stringify(body));
            response.end();
        });
    } else {
        // make error page
        response.writeHead(405, {'Content-Type': 'text/html', 'Allow': 'PUT'});
        response.write('Error 405: Method Not Allowed');
        response.end();
    }
}