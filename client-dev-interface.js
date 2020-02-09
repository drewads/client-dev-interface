// This is the main node file for client-dev-interface
// accepts urls of the form /client-dev-interface/resource.js
// directs http requests to the right resource

const actions = {
    'create' : require('./create'),
    'edit' : require('./edit'),
    'upload' : require('./upload'),
    'move' : require('./move'),
    'delete' : require('./delete.js'),
    'save' : require('./save-changes'),
    'dir-snapshot' : require('./dir-snapshot')
};

const url = require('url');
const Success = require('./Success');
const DevError = require('./DevError');

exports.Success = Success;
exports.Error = DevError;

// regex of characters after /client-dev-interface/
const resourceRegex = /(?<=\/client-dev-interface\/).+/;

exports.handle = async (request, systemRoot) => {
    const query = url.parse(request.url, true);
    // find part of the url after /client-dev-interface
    const resource = query.pathname.match(resourceRegex);
    
    // access the right resource with actions['resource']. needs to check null before access at index
    if (resource && resource[0] && actions[resource[0]]) {
        try {
            return await actions[resource[0]].handle(request, systemRoot);
        } catch (error) {
            throw error;
        }
    } else {
        throw new DevError.DevError(ENORES, 404, {}, 'client-dev-interface', 'Resource not found.');
    }
}