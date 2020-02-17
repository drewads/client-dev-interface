/**
 * This file contains the DevError object and custom error codes
 * for use with the DevError object. DevError extends the standard
 * Error object, but includes some special members for use with
 * the client-dev-interface modules.
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
/** Filesystem entry could not be moved/renamed */
exports.EMOVE = 'ENTRY_NOT_MOVED';
/** Directory not empty */
exports.ENOTEMPTY = 'DIRECTORY_NOT_EMPTY';

/**
 * This is an Error object that has its own error codes and includes
 * extra data members on top of the standard Error type.
 * These are:
 * code - the DevError code, as defined in the DevError module
 * statusCode - the recommended HTTP response status code
 * responseHeaders - recommended HTTP response headers as a JavaScript object
 * module - the client-dev-interface sub-module that this error originated in
 * message - the standard message member, inherited from standard Error
 * 
 * @extends {Error} standard error class
 */
exports.DevError = class DevError extends Error {
    constructor(code, statusCode, responseHeaders = {}, devModule, ...ErrorParams) {
        super(ErrorParams);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DevError);
        }

        this.code = code;
        this.statusCode = statusCode;
        this.responseHeaders = responseHeaders;
        this.module = devModule;
    }
}