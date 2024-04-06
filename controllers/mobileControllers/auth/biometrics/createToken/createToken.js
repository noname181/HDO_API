"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const newRole_middleware_1 = require("../../../../../middleware/newRole.middleware");
const md5Hash_1 = require("../../../../../util/md5Hash");
exports.createToken = {
    path: '/mobile/auth/biometrics/token',
    method: 'post',
    checkToken: false,
    roles: [],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    const { body } = request;
    const { deviceId = '' } = body;
    if (!deviceId) {
        return next('INVALID_INPUT');
    }
    const token = (0, md5Hash_1.md5Hash)(deviceId);
    return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json({ token });
}
function validator(request, response, next) {
    next();
}
function errorHandler(error, request, response, next) {
    if (error === 'INVALID_INPUT') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '유효하지 않은 값입니다.',
        });
    }
    next();
}
