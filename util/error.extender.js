"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (_request, _response, next) => {
    _response.error = {
        badRequest: (errorCode, message, options = {}) => {
            const status = 400;
            _response.status(status).json({
                status: status.toString(),
                errorCode: errorCode,
                message: message,
                incorrect: options.incorrect ? options.incorrect : undefined,
                objects: options.objects ? options.objects : undefined
            }).end();
        },
        unauthorization: (errorCode, message) => {
            const status = 401;
            _response.status(status).json({
                status: status.toString(),
                errorCode: errorCode,
                message: message,
            }).end();
        },
        forbidden: (errorCode, message) => {
            const status = 403;
            _response.status(status).json({
                status: status.toString(),
                errorCode: errorCode,
                message: message,
            }).end();
        },
        notFound: (errorCode, message, options = {}) => {
            const status = 404;
            _response.status(status).json({
                status: status.toString(),
                errorCode: errorCode,
                message: message,
                objects: options.objects ? options.objects : undefined,
            }).end();
        },
        unknown: (_error) => {
            const status = 409;
            _response.status(status).json({
                status: status.toString(),
                errorCode: "UNKNOWN_ERROR",
                message: JSON.stringify(_error, null, 2)
            }).end();
        }
    };
    next();
};
exports.default = errorHandler;
