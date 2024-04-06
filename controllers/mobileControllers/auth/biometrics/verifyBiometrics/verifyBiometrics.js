"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBiometrics = void 0;
const newRole_middleware_1 = require("../../../../../middleware/newRole.middleware");
const config_1 = require("../../../../../config/config");
const passwordService_1 = require("../../../../../util/passwordService");
const models = require('../../../../../models');
exports.verifyBiometrics = {
    path: '/mobile/auth/biometrics/verify',
    method: 'post',
    checkToken: true,
    roles: [],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { body, user: userAuth } = request;
        const { deviceId = '', password = '' } = body;
        if (!password) {
            return next('INVALID_INPUT');
        }
        if (!passwordValidator(password)) {
            return next('INVALID_PASSWORD');
        }
        const user = yield models.UsersNew.findByPk(userAuth.id);
        if (!user) {
            return next('USER_IS_NOT_FOUND');
        }
        const config = (0, config_1.configuration)();
        const passwordService = new passwordService_1.PasswordService(config);
        const isMatchPassword = yield passwordService.compare(password, user.hashPassword);
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json({ result: isMatchPassword });
    });
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
            message: '유효하지 않은 결제입니다.',
        });
    }
    if (error === 'INVALID_PASSWORD') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '비밀번호가 유효하지 않습니다',
        });
    }
    if (error === 'USER_IS_NOT_FOUND') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '회원이 없습니다.',
        });
    }
    next();
}
const passwordValidator = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z!@#$%^&*\d]{8,12}$/g;
    return password ? regex.test(password) : false;
};
