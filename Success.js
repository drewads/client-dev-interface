/**
 * This file contains the Success object, which has data members
 * that describe the parameters of a successful operation within
 * the client-dev-interface module.
 */

'use strict';

/**
 * Success is an object with data members containing information
 * about a successful client-dev-interface operation.
 * These data members are:
 * statusCode - the recommended HTTP response status code
 * responseHeaders - recommended HTTP response headers as a JavaScript object.
 * module - the client-dev-interface sub-module that this error originated in
 * body - recommended HTTP response body.
 */
exports.Success =  class Success {
    constructor(statusCode, responseHeaders, devModule, body) {
        this.statusCode = statusCode;
        this.responseHeaders = responseHeaders;
        this.module = devModule;
        this.body = body;
    }
}