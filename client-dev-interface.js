// This is the main node file for client-dev-interface
// accepts urls of the form /client-dev-interface/resource.js
// directs http requests to the right resource

const actions = {
    'create' : require('./create'),
    'edit' : require('./edit'),
    'upload' : require('./upload'),
    'move' : require('./move'),
    'delete' : require('./delete'),
    'save' : require('./save-changes')
};

const url = require('url');

handle = (request, response, systemRoot) => {
    const query = url.parse(request.url, true);
    // find part of the url after /client-dev-interface
    // access the right resource with actions['resource']
}

exports.handle;