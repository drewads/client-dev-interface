// This is the main node file for client-dev-interface
// accepts urls of the form /client-dev-interface/resource.js
// directs http requests to the right resource

const actions = {
    'create' : require('./create'),
    'edit' : require('./edit'),
    'upload' : require('./upload'),
    'move' : require('./move'),
    'delete' : require('./delete'),
    'save' : require('./save-changes'),
    'dir-snapshot' : require('./dir-snapshot')
};

const url = require('url');

// regex of characters after /client-dev-interface/
const resourceRegex = /(?<=\/client-dev-interface\/).+/;

exports.handle = (request, response, systemRoot) => {
    const query = url.parse(request.url, true);
    // find part of the url after /client-dev-interface
    const resource = query.pathname.match(resourceRegex);
    
    // access the right resource with actions['resource']. needs to check null before access at index
    if (resource && resource[0] && actions[resource[0]]) {
        actions[resource[0]].handle(request, response, systemRoot);
    } else {
        // send some error with error page, probably
        // create error page explaining path is incorrect and maybe make it specific to the dev stuff
        // serve an error page in the dev root, but if that doesn't exist, serve plain html
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.write('Error 404: Resource Not Found');
        response.end();
    }
}