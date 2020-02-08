'use strict';

export const EBODY = 'INCORRECT_BODY'; // http request body has incorrect format
export const EMET = 'INCORRECT_METHOD'; // http request method not allowed
export const ENOENT = 'ENTRY_NONEXISTENT'; // requested filesystem entry does not exist
export const ERMENT = 'ENTRY_NOT_REMOVED'; // filesystem entry could not be removed

export class DevError extends Error {
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