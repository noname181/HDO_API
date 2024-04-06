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
const tokenService_1 = require("../../util/tokenService");
const { USER_ROLE } = require('../../middleware/role.middleware');
// const models = require('../../models');
const firebase = require('firebase-admin');
const axios = require('axios');
const firebaseServiceAccount = require('../../config/hdo-ev-charge-firebase-adminsdk-bbf6m-2e1b232ac4.json');
module.exports = {
    path: ['/topic'],
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.EXTERNAL, tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.MOBILE],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(_request, _response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deviceId = 'SOME_DEVICE_ID';
            // detail 쿼리로 구독한 토픽 조회
            try {
                const topic = yield axios({
                    url: 'https://iid.googleapis.com/iid/info/' + deviceId + '?details=true',
                    method: 'GET',
                    headers: {
                        Authorization: 'key=' + process.env.FCM_API_KEY,
                    },
                });
                // Handle the response
                _response.json(topic.data);
            }
            catch (error) {
                _response.error.badRequest('error', error.toString());
            }
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
