"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const newRole_middleware_1 = require("../../middleware/newRole.middleware");
const http_exception_1 = require("../http.exception");
class NotFoundException extends http_exception_1.HttpException {
    constructor(message, errorCode) {
        super(newRole_middleware_1.HTTP_STATUS_CODE.NOT_FOUND, message, errorCode);
    }
}
exports.NotFoundException = NotFoundException;
