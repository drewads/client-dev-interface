/**
 * test_server.js contains the server used to test client-dev-interface.
 * To use (command line + browser):
 * * navigate to the tests folder
 * * enter the command node test_server.js
 * * in the browser URL bar, type http://localhost:8080/test.html for general tests
 * * in the browser URL bar, type http://localhost:8080/uploadTest.html for upload tests
 * * note that upload tests will add files to your machine's filesystem that must then be manually removed
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const fsPromises = fs.promises;
const mime = require('mime');

const cdi = require('./../client-dev-interface.js');

const devURLRegex = /^\/client-dev-interface/; // looks for '/client-dev-interface' at start of path
const systemRoot = '.';
const PORT = 8080;

/**
 * Acts like a struct to store and pass the parameters that make up an HTTP response
 */
class ResponseParams {
    constructor(statusCode, headers, body) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = body;
    }
}

/**
 * sendRequestToCDI takes an HTTP request as an argument and forwards the request
 * to client-dev-interface. It returns a Promise, the value of which is a
 * ResponseParams object containing the proper response status code, headers,
 * and body to send to the client.
 * 
 * @param {IncomingMessage} request HTTP request
 */
const sendRequestToCDI = async (request) => {
    try {
        const success = await cdi.handle(request, systemRoot);
        return new ResponseParams(success.statusCode, success.responseHeaders, success.body);
    } catch (error) {
        const headers = error.responseHeaders;

        // default content-type header is text/plain
        if (headers['Content-Type'] == undefined) {
            headers['Content-Type'] = 'text/plain';
        }

        return new ResponseParams(error.statusCode, headers, error.message);
    }
}

/**
 * serveFile is the main operation in the functionality of the file server. It
 * takes a file path as an argument and returns a Promise, the value of which
 * is a ResponseParams object containing the response code, headers, and body
 * to send in the response to the client.
 * 
 * @param {string} filepath path to the file to serve to the client
 */
const serveFile = async (filepath) => {
    try {
        const responseBody = await fsPromises.readFile(filepath);
        // content type is null if no file extension
        return new ResponseParams(200, {'Content-Type': mime.getType(filepath)}, responseBody);
    } catch (error) {
        return new ResponseParams(404, {'Content-Type': 'text/html'}, 'Error 404: File Not Found');
    }
}

/**
 * This function handles the requests received by the server. If a request
 * should be handled by client-dev-interface, it sends the request there.
 * Otherwise, it acts as a normal fileserver.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {ServerResponse} response HTTP response
 */
const handleRequest = async (request, response) => {
    const query = url.parse(request.url, true);

    let responseParams;

    // when we receive dev requests
    if (devURLRegex.test(query.pathname)) {
        responseParams = await sendRequestToCDI(request);
    } else if (request.method.toUpperCase() !== 'GET' && request.method.toUpperCase() !== 'HEAD') {
        responseParams = new ResponseParams(405, {'Content-Type': 'text/html', 'Allow': 'GET, HEAD'},
                                            'Error 405: Method Not Allowed');
    } else {
        // normal fileserver here
        responseParams = await serveFile('.' + query.pathname);
    }

    response.writeHead(responseParams.statusCode, responseParams.headers);
    if (request.method.toUpperCase() != 'HEAD') response.write(responseParams.body);
    response.end();
}

http.createServer((request, response) => handleRequest(request, response)).listen(PORT, () => {
    // print instructions for use to command line
    console.log(`client-dev-interface test server listening on port ${PORT}.\n`
                + `To use (command line + browser):\n`
                + `navigate to the tests folder\n`
                + `enter the command node test_server.js\n`
                + `in the browser URL bar, type http://localhost:8080/test.html for general tests\n`
                + `in the browser URL bar, type http://localhost:8080/uploadTest.html for upload tests\n`
                + `note that upload tests will add files to your machine's filesystem that must `
                + `then be manually removed\n`);
});