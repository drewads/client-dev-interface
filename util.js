/**
 * util.js is a utility module that provides functions common to all
 * of the dev modules.
 */


/**
 * getBody takes an HTTP request with a JavaScript
 * object as JSON in the body, and it returns a
 * Promise. On success, the Promise has the
 * JavaScript object as its value, and on
 * failure, the Promise is rejected with a string
 * explaining the failure.
 * 
 * @param {IncomingMessage} request HTTP request
 * @return {Promise} if resolved, value is body as JavaScript object
 */
exports.getBodyAsJSON = (request) => {
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
                // this will happen if the body is not encoded as JSON
                reject('request body could not be parsed as JSON.');
            }
        });
    });
}