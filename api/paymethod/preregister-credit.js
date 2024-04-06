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
const easypay_1 = require("../../util/easypay");
const config_1 = require("./config");
const axios_1 = __importDefault(require("axios"));
const tokenService_1 = require("../../util/tokenService");
const models = require('../../models');
const _service = {
    path: ['/paymethod/preregister'],
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.MOBILE],
    service,
    validator,
    errorHandler,
};
exports.default = _service;
function requestPreregister(body, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const method = 'POST';
        const url = config_1.easypayApiHost + '/api/trades/webpay';
        const headers = { 'Content-Type': 'application/json' };
        const response = yield (0, axios_1.default)({ url, headers, method, data: body });
        const responseBody = response.data;
        try {
            const cardLogData = {
                url,
                content: responseBody,
                userId,
            };
            console.log('preregister credit::requestPreregister::store log::success', responseBody);
            yield models.AllLogs.create(cardLogData);
        }
        catch (err) {
            console.log('preregister credit::requestPreregister::store log::err', err);
        }
        if (response.status >= 400 || responseBody.resCd != easypay_1.EasyPayStatusCode.N0000) {
            throw new easypay_1.EasyPayError(easypay_1.EasyPayErrorType.FAILED_TO_PREREGISTER_CREDIT, responseBody.resMsg);
        }
        return responseBody;
    });
}
/**
 * GET /payment/preregister
 * query parameters
 * * `shopOrderNo`: unique order number
 * * `deviceTypeCode`: device type, this must be one of `mobile` or `pc`, default is `mobile`
 */
function service(req, res, _) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { user: authUser, url } = req;
        // shopOrderNo is already validated
        const shopOrderNo = req.query.shopOrderNo;
        const deviceTypeCode = (_a = req.query.device) !== null && _a !== void 0 ? _a : 'mobile';
        try {
            const preregisterResponse = yield requestPreregister({
                mallId: config_1.easypayMallId,
                payMethodTypeCode: '81',
                currency: '00',
                clientTypeCode: '00',
                returnUrl: config_1.easypayReturnUrl,
                deviceTypeCode: deviceTypeCode,
                shopOrderNo: shopOrderNo,
                amount: 0,
                orderInfo: { goodsName: '카드 등록' },
                payMethodInfo: { billKeyMethodInfo: { certType: '0' } },
                shopValueInfo: {
                    value1: req.headers['authorization'],
                },
            }, authUser.id);
            res.setHeader('Location', preregisterResponse.authPageUrl);
            res.sendStatus(303);
        }
        catch (error) {
            if (error instanceof easypay_1.EasyPayError) {
                const body = { message: error };
                res.sendStatus(400);
                res.json(body);
                return;
            }
            // TODO replace console.log
            console.log('an error occured while requesting credit preregister');
            console.log(error);
            res.sendStatus(500);
            return;
        }
    });
}
function validator(req, _arg1, next) {
    if (!req.query.shopOrderNo) {
        next('query parameter "shopOrderNo" is missing');
        return;
    }
    next();
}
/** express error handler cannot catch errors from async middleware */
function errorHandler(error, _arg1, _arg2, next) {
    return next(error);
}
