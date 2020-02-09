'use strict';

exports.ENORES = 'RESOURCE_NONEXISTENT'; // resource specified in request url does not exist
exports.EBODY = 'INCORRECT_BODY'; // http request body has incorrect format
exports.EMET = 'INCORRECT_METHOD'; // http request method not allowed
exports.ENOENT = 'ENTRY_NONEXISTENT'; // requested filesystem entry does not exist
exports.ERMENT = 'ENTRY_NOT_REMOVED'; // filesystem entry could not be removed

exports.DevError = class DevError extends Error {
    constructor(code, statusCode, responseHeaders = {}, devModule, ...params) {
        super(params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DevError);
        }

        this.code = code;
        this.statusCode = statusCode;
        this.responseHeaders = responseHeaders;
        this.module = devModule;
    }
}