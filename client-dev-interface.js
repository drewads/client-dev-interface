/**
* This is the main module for client-dev-interface.
* It accepts an HTTP request with URI of the form:
* /client-dev-interface/resource.js, where "resource"
* is one of the keys in the actions JavaScript object
* defined below. This file then passes the given
* HTTP request to the correct resource module, if one
* exists.
*/

'use strict';

// list of modules corresponding to filesystem actions
const actions = {
    'create' : require('./create'),
    'edit' : require('./edit'),
    'upload' : require('./upload'),
    'move' : require('./move'),
    'delete' : require('./delete.js'),
    'save' : require('./save'),
    'dir-snapshot' : require('./dir-snapshot'),
    'exists' : require('./exists')
};

const url = require('url');
const Success = require('./Success');   // gives access to Success object
const DevError = require('./DevError'); // gives access to DevError object and error codes

// export both of these to the user of this module
exports.Success = Success;
exports.Error = DevError;

// regex to find characters after /client-dev-interface/ in a URI
const resourceRegex = /(?<=\/client-dev-interface\/).+/;

/**
 * handle accepts an HTTP request and a string that is the
 * absolute path of the directory that is considered the
 * root of the server. systemRoot will be concatenated with
 * URIs from the HTTP request to determine file and directory
 * location.
 *
 * A Success object is returned if the entire operation was
 * successful, and a DevError object is returned if the
 * operation was not successful or the requested resource
 * was not found.
 * 
 * @param {IncomingMessage} request HTTP request
 * @param {string} systemRoot root of the server filesystem
 * @return {Promise} resolves with Success object if successful operation, DevError thrown otherwise
 */
exports.handle = async (request, systemRoot) => {
    const query = url.parse(request.url, true);

    // find part of the url after /client-dev-interface
    const resource = query.pathname.match(resourceRegex);
    
    // access the right resource with actions['resource']
    // checks that resource is not null before access at index
    if (resource && resource[0] && actions[resource[0]]) {
        try {
            // this will be a Success object
            return await actions[resource[0]].handle(request, systemRoot);
        } catch (error) {
            // this will be a DevError object
            throw error;
        }
    } else {
        throw new DevError.DevError(ENORES, 404, {}, 'client-dev-interface', 'Resource not found.');
    }
}