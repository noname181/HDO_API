"use strict";
/**
 * Created by Jackie Yoon on 2023-07-17.
 * FCM 테스트 API
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
const tokenService_1 = require("../../util/tokenService");
const { USER_ROLE } = require('../../middleware/role.middleware');
const notification = require('../../middleware/send-notification');
module.exports = {
    path: ['/test-fcm'],
    method: 'post',
    checkToken: false,
    roles: [tokenService_1.USER_TYPE.EXTERNAL, tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.MOBILE],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(_request, _response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = _request.body;
        try {
            const deviceId = body.deviceId;
            const testNotification = yield notification.sendNotification('PO', {
                topic: 'noti-test-123',
                title: '알림 테스트입니다.',
                type: 'PERSONAL',
            }, '알림 기능 개발을 위한 테스트입니다.', deviceId, '01012345678', 'TEMPLATE');
            _response.json(testNotification);
        }
        catch (e) {
            next(e);
        }
    });
}
function validator(_request, _response, next) {
    next();
}
function errorHandler(_error, _request, _response, next) {
    console.error(_error);
    _response.error.unknown(_error.toString());
    next(_error);
}
