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
exports.TokenService = exports.USER_TYPE = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
var USER_TYPE;
(function (USER_TYPE) {
    USER_TYPE["HDO"] = "hdo";
    USER_TYPE["EXTERNAL"] = "org";
    USER_TYPE["MOBILE"] = "mobile";
})(USER_TYPE || (exports.USER_TYPE = USER_TYPE = {}));
class TokenService {
    constructor(config) {
        this.config = config;
    }
    accessTokenGenerator(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.config.jwtAccessTokenKey;
            const expiredTime = this.config.jwtAccessTokenExpireTime;
            return yield this.tokenGenerator(payload, key, expiredTime);
        });
    }
    refreshTokenGenerator(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.config.jwtRefreshTokenKey;
            const expiredTime = this.config.jwtRefreshTokenExpireTime;
            return yield this.tokenGenerator(payload, key, expiredTime);
        });
    }
    tokenGenerator(payload, key, expiredTime) {
        return new Promise((resolve, reject) => {
            const token = (0, jsonwebtoken_1.sign)(payload, key, { expiresIn: expiredTime });
            if (!token) {
                reject(new Error('Error while create token'));
            }
            resolve(token);
        });
    }
    verifyToken(token, key) {
        return new Promise((resolve, reject) => {
            try {
                const payload = (0, jsonwebtoken_1.verify)(token, key);
                const isDecodeValid = this.checkDecodeObject(payload);
                if (isDecodeValid) {
                    resolve({
                        id: payload.id,
                        accountId: payload.accountId,
                        type: payload.type,
                        roleId: payload.roleId || undefined,
                    });
                }
                reject(new Error('TOKEN_IS_INVALID'));
            }
            catch (error) {
                if (error instanceof Error && error.message === 'invalid signature') {
                    reject(new Error('SIGNATURE_INVALID'));
                }
                if (error instanceof Error && error.message === 'jwt expired') {
                    reject(new Error('TOKEN_IS_EXPIRED'));
                }
                reject(new Error('TOKEN_IS_INVALID'));
            }
        });
    }
    checkDecodeObject(object) {
        return 'id' in object && 'accountId' in object;
    }
}
exports.TokenService = TokenService;
