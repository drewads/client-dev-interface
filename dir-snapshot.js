exports.handle = (request, response, systemRoot) => {
    console.log(systemRoot + request.url);
    response.end();
}