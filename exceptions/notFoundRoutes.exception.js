"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundRoutesException = void 0;
const newRole_middleware_1 = require("../middleware/newRole.middleware");
const http_exception_1 = require("./http.exception");
class NotFoundRoutesException extends http_exception_1.HttpException {
    constructor() {
        super(newRole_middleware_1.HTTP_STATUS_CODE.NOT_FOUND, 'Router is not found', 'ROUTER_NOT_FOUND');
    }
}
exports.NotFoundRoutesException = NotFoundRoutesException;
