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
exports.sendResetPasswordEmail = exports.genResetPasswordToken = exports.requestResetPassword = void 0;
const sequelize_1 = require("sequelize");
const tokenService_1 = require("../../../../../util/tokenService");
const newRole_middleware_1 = require("../../../../../middleware/newRole.middleware");
const crypto_1 = require("crypto");
const config_1 = require("../../../../../config/config");
const loggerService_1 = require("../../../../../services/loggerService/loggerService");
const emailService_1 = require("../../../../../services/emailService/emailService");
const models = require('../../../../../models');
exports.requestResetPassword = {
    path: '/web/auth/accounts/external/password/requests',
    method: 'post',
    checkToken: false,
    roles: [],
    permissions: [],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loggerService = new loggerService_1.LoggerService();
        try {
            const { body } = request;
            if (!body || !body.email) {
                throw 'INPUT_INVALID';
            }
            const email = body.email.toString().trim() || '';
            const userType = tokenService_1.USER_TYPE.EXTERNAL.toUpperCase();
            yield models.sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                const user = yield models.UsersNew.findOne({
                    where: {
                        [sequelize_1.Op.and]: [
                            {
                                accountId: email,
                            },
                            {
                                type: userType,
                            },
                        ],
                    },
                });
                if (!user) {
                    throw 'USER_IS_NOT_FOUND';
                }
                const token = genResetPasswordToken(user.accountId);
                yield models.UsersNew.update({
                    resetPasswordToken: token,
                }, {
                    where: {
                        id: user.id,
                    },
                }, { transaction: t });
                yield sendResetPasswordEmail(user.accountId, token, loggerService);
            }));
            return response.status(newRole_middleware_1.HTTP_STATUS_CODE.NO_CONTENT).json({});
        }
        catch (error) {
            console.log('error::', error);
            if (error instanceof Error) {
                return next('ERROR_WHILE_REQUEST_FIND_PASSWORD');
            }
            return next(error);
        }
    });
}
function validator(request, response, next) {
    next();
}
function errorHandler(error, request, response, next) {
    if (error === 'INPUT_INVALID') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '유효하지 않은 값입니다.',
        });
    }
    if (error === 'USER_IS_NOT_FOUND') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '이메일이 존재하지 않습니다. 다시 확인해주세요',
        });
    }
    if (error === 'ERROR_WHILE_REQUEST_FIND_PASSWORD') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '오류가 발생하였습니다.',
        });
    }
    next();
}
function genResetPasswordToken(email) {
    const dateStr = new Date().toISOString().split('T')[0];
    const concatenatedStr = `${email}${dateStr}`;
    return (0, crypto_1.createHash)('sha256').update(concatenatedStr).digest('hex');
}
exports.genResetPasswordToken = genResetPasswordToken;
function sendResetPasswordEmail(email, token, loggerService) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = (0, config_1.configuration)();
        const emailService = new emailService_1.EmailService(config, loggerService);
        const subject = 'EV&U 비밀번호 설정';
        const resetPasswordUrl = `${config.webAdminUrl}/password_reset?email=${email}&token=${token}`;
        // const message = createPasswordResetEmailContent(resetPasswordUrl);
        // const message = `비밀번호 설정을 하기 위해 해당 링크를 클릭하세요 \n: ${resetPasswordUrl}`;
        yield emailService.sendWithTemplateTemp(email, subject, resetPasswordUrl);
    });
}
exports.sendResetPasswordEmail = sendResetPasswordEmail;
