"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exceptionMiddleware = void 0;
const http_exception_1 = require("../exceptions/http.exception");
const exceptionMiddleware = (err, req, res, next) => {
    if (err instanceof http_exception_1.HttpException) {
        return err.response(req, res);
    }
    return res.status(500).json({
        errorCode: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString(),
        path: req.url,
        message: 'Something went wrong!',
    });
};
exports.exceptionMiddleware = exceptionMiddleware;
