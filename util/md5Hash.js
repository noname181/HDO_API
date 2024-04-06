"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5Hash = void 0;
const crypto_1 = require("crypto");
const md5Hash = (str) => {
    return (0, crypto_1.createHash)('md5').update(str).digest('hex');
};
exports.md5Hash = md5Hash;
