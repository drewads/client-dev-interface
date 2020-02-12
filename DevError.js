/**
 * 
 */

'use strict';

/******************** ERROR CODES ********************/
/** Resource specified in request url does not exist. */
exports.ENORES = 'RESOURCE_NONEXISTENT';
/** HTTP request body has incorrect format. */
exports.EBODY = 'INCORRECT_BODY';
/** HTTP request method not allowed. */
exports.EMET = 'INCORRECT_METHOD';
/** Requested filesystem entry does not exist. */
exports.ENOENT = 'ENTRY_NONEXISTENT';
/** Filesystem entry already exists. */
exports.EENTEX = 'ENTRY_ALREADY_EXISTS';
/** Filesystem entry could not be removed. */
exports.ERMENT = 'ENTRY_NOT_REMOVED';
/** Filesystem entry could not be created. */
exports.ECRENT = 'ENTRY_NOT_CREATED';
/** Open filesystem entry could not be closed. */
exports.ECLOSE = 'ENTRY_NOT_CLOSED';

/**
 * 
 */
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