"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const easypay_1 = require("../../util/easypay");
const config_1 = require("./config");
// @ts-ignore
const models_1 = __importStar(require("../../models"));
const axios_1 = __importDefault(require("axios"));
const tokenService_1 = require("../../util/tokenService");
const _service = {
    path: ['/paymethod/register'],
    method: 'post',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.MOBILE],
    service,
    validator,
    errorHandler,
};
exports.default = _service;
/**
 * generate UUID to be used as transaction ID for EasyPay API
 * It uses UUID v5 (namespace based with SHA1) using RFC URL namespace.
 * Username + delimiter + timestamp are supplied as input.
 */
function generateEasyPayUUID(userId, time) {
    const delimiter = '\x00';
    time.setSeconds(0);
    time.setMilliseconds(0);
    return (0, uuid_1.v5)(userId + delimiter + time.toISOString(), uuid_1.v5.URL);
}
function requestRegister(body, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const method = 'POST';
        const url = config_1.easypayApiHost + '/api/trades/approval';
        const headers = { 'Content-Type': 'application/json', Charset: 'utf-8' };
        const second = 1000;
        const response = yield (0, axios_1.default)({ url, headers, method, data: body, timeout: 30 * second });
        const responseBody = response.data;
        try {
            const cardLogData = {
                url,
                content: responseBody,
                userId,
            };
            console.log('preregister credit::requestPreregister::store log::success', responseBody);
            yield models_1.default.AllLogs.create(cardLogData);
        }
        catch (err) {
            console.log('preregister credit::requestPreregister::store log::err', err);
        }
        if (response.status >= 400 || responseBody.resCd != easypay_1.EasyPayStatusCode.N0000) {
            throw new easypay_1.EasyPayError(easypay_1.EasyPayErrorType.FAILED_TO_REGISTER_CREDIT, responseBody.resMsg);
        }
        return responseBody;
    });
}
/**
 * POST /payment/register
 */
function service(req, res, _) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return __awaiter(this, void 0, void 0, function* () {
        const { user: authUser, url } = req;
        const body = req.body;
        try {
            if (body.resCd != easypay_1.EasyPayStatusCode.N0000) {
                throw new easypay_1.EasyPayError(easypay_1.EasyPayErrorType.FAILED_TO_PREREGISTER_CREDIT, body.resMsg);
            }
            const now = new Date();
            /**
             * TODO EasyPay API expects clients to request abort if it fails somehow, but
             * it does not. It might invol DB operation but DB is
             * undocumented-messy-crap-hell for now, I'm doubt I can implement it in the
             * right way.
             */
            const registerResponse = yield requestRegister({
                mallId: config_1.easypayMallId,
                shopTransactionId: generateEasyPayUUID(req.user.id, now),
                authorizationId: body.authorizationId,
                shopOrderNo: body.shopOrderNo,
                approvalReqDate: formatApprovalDate(new Date()),
            }, authUser.id);
            const MAX_CARD_PER_USER = 5;
            const { count, rows: cards } = yield models_1.BankCard.findAndCountAll({ where: { userId: req.user.id } });
            if (count >= MAX_CARD_PER_USER) {
                return res.render('register-credit-result.ejs', {
                    result: 'fail',
                    message: '이미 5개 카드가 등록되었습니다. 카드 등록 위해서 삭제 먼저해주세요.',
                });
            }
            const cardNo = ((_b = (_a = registerResponse.paymentInfo) === null || _a === void 0 ? void 0 : _a.cardInfo) === null || _b === void 0 ? void 0 : _b.cardMaskNo)
                ? registerResponse.paymentInfo.cardInfo.cardMaskNo.toString()
                : '';
            const cardIssuer = ((_d = (_c = registerResponse.paymentInfo) === null || _c === void 0 ? void 0 : _c.cardInfo) === null || _d === void 0 ? void 0 : _d.issuerName)
                ? registerResponse.paymentInfo.cardInfo.issuerName.toString()
                : '';
            const [existsCardNo, existsCardIssuer] = cards.reduce((cardInfo, currentItem) => {
                const [existsCardNo, existsCardIssuer] = cardInfo;
                existsCardNo.push(currentItem.cardNo);
                existsCardIssuer.push(currentItem.cardIssuer);
                return [existsCardNo, existsCardIssuer];
            }, [[], []]);
            const isExistsCardNo = existsCardNo.includes(cardNo);
            const isExistsCardIssuer = existsCardIssuer.includes(cardIssuer);
            if (isExistsCardNo && isExistsCardIssuer) {
                return res.render('register-credit-result.ejs', {
                    result: 'fail',
                    message: '이미 등록된 카드입니다.',
                });
            }
            const paymethod = {
                userId: req.user.id,
                updatedAt: now,
                createdWho: req.user.id,
                updatedWho: req.user.id,
                cardNo: (_f = (_e = registerResponse.paymentInfo) === null || _e === void 0 ? void 0 : _e.cardInfo) === null || _f === void 0 ? void 0 : _f.cardMaskNo,
                billingKey: (_h = (_g = registerResponse.paymentInfo) === null || _g === void 0 ? void 0 : _g.cardInfo) === null || _h === void 0 ? void 0 : _h.cardNo,
                cardBrand: (_k = (_j = registerResponse.paymentInfo) === null || _j === void 0 ? void 0 : _j.cardInfo) === null || _k === void 0 ? void 0 : _k.acquirerName,
                cardIssuer: (_m = (_l = registerResponse.paymentInfo) === null || _l === void 0 ? void 0 : _l.cardInfo) === null || _m === void 0 ? void 0 : _m.issuerName,
            };
            yield models_1.BankCard.create(paymethod);
            res.render('register-credit-result.ejs', { result: 'success', message: '' });
        }
        catch (error) {
            // TODO replace console.log
            // DB error
            if (error instanceof sequelize_1.BaseError) {
                console.log('an error occured while operating DB');
                console.log(error);
                res.status(500);
                return;
            }
            // EasyPay API error
            if (error instanceof easypay_1.EasyPayError) {
                if (error.type == easypay_1.EasyPayErrorType.FAILED_TO_REGISTER_CREDIT) {
                    console.log('EasyPay API rejected credit registe request');
                    console.log('message: ', error.message);
                }
                else {
                    console.log('an error occured while registering credit');
                    console.log(error);
                }
                const payload = {
                    result: 'fail',
                    message: error.message,
                };
                res.status(400);
                res.render('register-credit-result.ejs', payload);
                return;
            }
            console.log('an unknown error occured while registering credit');
            console.log(error);
            res.status(500);
            return;
        }
    });
}
function validator(_arg0, _arg1, next) {
    next();
}
function errorHandler(error, _arg1, res, _arg3) {
    console.log('an exception has thrown during processing POST /payment/register');
    console.log(error);
    res.status(500);
    const payload = { result: 'failed', message: 'server error' };
    res.render('register-credit-result.ejs', payload);
    return;
}
function formatApprovalDate(date) {
    const yyyy = date.getFullYear().toString();
    const mm = date.getMonth().toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return yyyy + mm + dd;
}
