'use strict';

export const EDEF = 'DEFAULT';


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