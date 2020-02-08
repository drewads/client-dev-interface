'use strict';

export class Success {
    constructor(statusCode, responseHeaders = {}, devModule, message='') {
        this.statusCode = statusCode;
        this.responseHeaders = responseHeaders;
        this.module = devModule;
        this.message = message;
    }
}