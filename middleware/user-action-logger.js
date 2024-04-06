"use strict";
/**
 * 해당 유저가 API 호출 시 마다 StackDriver에 로그를 남기기 위한 Logger
 */
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
exports.userActionLogMiddleware = void 0;
const request_ip_1 = require("request-ip");
const userLogStatus_interface_1 = require("../interfaces/userLogStatus.interface");
const lodash_1 = require("../util/lodash");
const models = require('../models');
const userActionLogMiddleware = (logDisable = false, status = 'INFO') => {
    return (_request, _response, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (logDisable) {
            next();
            return;
        }
        try {
            // firebase에선 uid, aws에선 sub or username
            const ipAddress = (0, request_ip_1.getClientIp)(_request) || '';
            const { user, originalUrl, method, headers, useragent } = _request;
            const agent = (useragent === null || useragent === void 0 ? void 0 : useragent.source) || 'unknown';
            const requestInfo = `, ip: ${ipAddress}, url: ${originalUrl},  method: ${method}, user-agent: ${agent}`;
            const maskSensitive = maskSensitiveKeys(_request.body);
            const maskSensitiveInfo = maskSensitive ? `, ${JSON.stringify(maskSensitive)}` : '';
            const logInfoString = user
                ? `user-action-log, email: ${user.id || 'unknown'}, sub: ${user.id || 'unknown'}, userId: ${user.id || 'unknown'}${requestInfo}${maskSensitiveInfo}`
                : `user-action-log, email: unknown, userId: unknown${requestInfo}${maskSensitiveInfo}`;
            console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + logInfoString);
            const logMethod = ['DELETE', 'POST', 'PUT'];
            let logStatus = logMethod.find((item) => item === _request.method.toUpperCase()) || status;
            const getStatus = findLogStatus(logStatus);
            if (user) {
                yield models.UserLogs.create({
                    status: getStatus,
                    ipAddress,
                    note: logInfoString,
                    userId: user.id,
                    urlPage: headers['location'] || undefined,
                });
            }
            return next();
        }
        catch (e) {
            console.error(e);
            return next();
        }
    });
};
exports.userActionLogMiddleware = userActionLogMiddleware;
// body에 민감한 키값이 있을 경우 *로 마스킹 처리
function maskSensitiveKeys(request) {
    const { body } = request;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return '';
    }
    const requestBody = (0, lodash_1.cloneDeep)(body);
    const keys = Object.keys(requestBody);
    for (const key of keys) {
        if (typeof body[key] === 'string' &&
            (key.toLowerCase().includes('password') ||
                key.toLowerCase().includes('name') ||
                key.toLowerCase().includes('phonenumber') ||
                key.toLowerCase().includes('phoneno'))) {
            requestBody[key] = '********';
        }
    }
    return requestBody;
}
const findLogStatus = (status) => {
    const logStatus = {
        private: userLogStatus_interface_1.USER_LOG_STATUS.PRIVATE,
        info: userLogStatus_interface_1.USER_LOG_STATUS.INFO,
        delete: userLogStatus_interface_1.USER_LOG_STATUS.DELETE,
        post: userLogStatus_interface_1.USER_LOG_STATUS.CREATE,
        put: userLogStatus_interface_1.USER_LOG_STATUS.UPDATE,
    };
    return logStatus[status.toLowerCase()] || logStatus.info;
};
