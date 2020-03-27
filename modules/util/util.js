/**
 * util.js is a utility module that provides functions common to all
 * of the dev modules.
 */

const path = require('path');

/**
 * getBody takes an HTTP request as input, and it
 * returns a Promise. When the HTTP request ends,
 * the Promise has the body as a string as its value.
 * 
 * @param {IncomingMessage} request HTTP request
 * @return {Promise} when resolved, value is body as JavaScript object
 */
exports.getBody = (request) => {
    return new Promise((resolve) => {
        let body = [];
        
        request.on('data', (chunk) => {
            body.push(chunk);
        });
        
        request.on('end', () => {
            resolve(Buffer.concat(body).toString());
        });
    });
}

/**
 * getBodyAsJSON takes an HTTP request with a JavaScript
 * object as JSON in the body, and it returns a
 * Promise. On success, the Promise has the
 * JavaScript object as its value, and on
 * failure, the Promise is rejected with a string
 * explaining the failure.
 * 
 * @param {IncomingMessage} request HTTP request
 * @return {Promise} if resolved, value is body as JavaScript object
 */
exports.getBodyAsJSON = async (request) => {
    try {
        return JSON.parse(await this.getBody(request));
    } catch {
        // this will happen if the body is not encoded as JSON
        throw 'request body could not be parsed as JSON';
    }
}


/**
 * This function takes two parameters, dir and root, which are both
 * absolute filepaths, and it returns true if dir is a descendant
 * of root or false otherwise.
 * 
 * @param {string} dir the absolute filepath of the potential descendant
 * @param {string} root the absolute filepath of the potential ancestor
 * @return {boolean} true if dir is a descendant of root
 */
exports.isDescendantOf = (dir, root) => {
    let dirResolved = path.resolve(dir);      // remove .. and .
    let rootResolved = path.resolve(root);    // remove .. and .

    dirResolved += (dirResolved.endsWith('/') ? '' : '/');      // add trailing slashes
    rootResolved += (rootResolved.endsWith('/') ? '' : '/');    // add trailing slashes

    return dirResolved.startsWith(rootResolved);
}