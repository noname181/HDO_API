"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
class HttpException extends Error {
    constructor(status, message, errorCode) {
        super(message);
        this.message = message;
        this.status = status;
        this.errorCode = errorCode;
    }
    response(req, res) {
        return res.status(this.status).json({
            errorCode: this.errorCode,
            timestamp: new Date().toISOString(),
            path: req.url,
            message: this.message,
        });
    }
}
exports.HttpException = HttpException;
