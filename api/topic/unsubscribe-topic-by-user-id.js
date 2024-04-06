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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { USER_ROLE } = require('../../middleware/role.middleware');
const axios_1 = __importDefault(require("axios"));
const tokenService_1 = require("../../util/tokenService");
// const models = require('../../models');
const firebase = require('firebase-admin');
const firebaseServiceAccount = require('../../config/hdo-ev-charge-firebase-adminsdk-bbf6m-2e1b232ac4.json');
module.exports = {
    path: ['/unsubscribe-topic'],
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
            const topic = body.topic;
            yield firebase.initializeApp({
                credential: firebase.credential.cert(firebaseServiceAccount),
            });
            // Topic 구독해제 with REST API
            try {
                const subscribe = yield (0, axios_1.default)({
                    url: 'https://iid.googleapis.com/iid/v1/' + deviceId + '/rel/topics/' + topic,
                    method: 'DELETE',
                    headers: {
                        Authorization: 'key=' + process.env.FCM_API_KEY,
                    },
                });
                // Handle the response
                _response.json(subscribe.statusText);
            }
            catch (error) {
                _response.error.badRequest('error', error.toString());
            }
            yield firebase.app().delete();
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
