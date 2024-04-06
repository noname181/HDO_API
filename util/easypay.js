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
exports.fixEucKr = exports.EasyPayStatusCode = exports.EasyPayError = exports.EasyPayErrorType = void 0;
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const content_type_1 = require("content-type");
const qs_1 = require("qs");
var EasyPayErrorType;
(function (EasyPayErrorType) {
    EasyPayErrorType[EasyPayErrorType["FAILED_TO_PREREGISTER_CREDIT"] = 0] = "FAILED_TO_PREREGISTER_CREDIT";
    EasyPayErrorType[EasyPayErrorType["FAILED_TO_REGISTER_CREDIT"] = 1] = "FAILED_TO_REGISTER_CREDIT";
})(EasyPayErrorType || (exports.EasyPayErrorType = EasyPayErrorType = {}));
class EasyPayError {
    constructor(type, message) {
        this.type = type;
        this.message = message;
    }
    toJSON() {
        switch (this.type) {
            case EasyPayErrorType.FAILED_TO_PREREGISTER_CREDIT:
                return 'failed to preregister credit';
            case EasyPayErrorType.FAILED_TO_REGISTER_CREDIT:
                return 'failed to register credit';
        }
    }
}
exports.EasyPayError = EasyPayError;
var EasyPayStatusCode;
(function (EasyPayStatusCode) {
    /** Good, consider other codes not good state */
    EasyPayStatusCode["N0000"] = "0000";
})(EasyPayStatusCode || (exports.EasyPayStatusCode = EasyPayStatusCode = {}));
/*
 * This code is copied from gist, pay him some respect smh
 * https://gist.github.com/boutdemousse/aca9010952e98ce2a4088a5dca261deb
 */
const toHex = (n) => parseInt('0x' + n);
const decodeEuckrUrlToUTF8 = (str = '') => str.replace(/(%([^%]{2}))+/g, (chars) => {
    const b = Buffer.from(chars.split('%').slice(1).map(toHex));
    return iconv_lite_1.default.decode(b, 'EUC-KR');
});
function fixEucKr(req, _res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.headers['content-type']) {
            next();
            return;
        }
        const contentType = (0, content_type_1.parse)(req.headers['content-type']);
        if (contentType.type != 'application/x-www-form-urlencoded') {
            next();
            return;
        }
        const charset = (_a = contentType.parameters['charset']) !== null && _a !== void 0 ? _a : 'utf-8';
        if (charset.toLowerCase() !== 'euc-kr') {
            console.log("!!! 노티 euc-kr이라 next로 넘겼음");
            next();
            return;
        }
        req.headers['content-type'] = 'x-damn-it-kicc';
        const raw = yield new Promise((resolve, reject) => {
            let raw = '';
            req.on('data', (chunk) => {
                raw += chunk;
            });
            req.on('end', () => {
                resolve(decodeEuckrUrlToUTF8(raw));
            });
            req.on('error', (error) => {
                reject(error);
            });
        });
        const body = (0, qs_1.parse)(raw, { charset: 'utf-8' });
        req.body = body;
        next();
        return;
    });
}
exports.fixEucKr = fixEucKr;
