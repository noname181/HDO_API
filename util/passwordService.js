"use strict";
// export const hashPassword = async (password: string): Promise<string> {
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
exports.PasswordService = void 0;
const bcrypt_1 = require("bcrypt");
// }
class PasswordService {
    constructor(config) {
        this.config = config;
    }
    hash(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = this.config.salt;
            const salt = yield (0, bcrypt_1.genSalt)(saltRounds);
            const passwordHashed = yield (0, bcrypt_1.hash)(password, salt);
            return {
                salt,
                passwordHashed,
            };
        });
    }
    compare(password, passwordHashed) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, bcrypt_1.compare)(password, passwordHashed);
        });
    }
}
exports.PasswordService = PasswordService;
