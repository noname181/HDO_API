"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const preregister_credit_1 = __importDefault(require("../../api/paymethod/preregister-credit"));
const register_credit_1 = __importDefault(require("../../api/paymethod/register-credit"));
const config_1 = require("../../config/config");
const tokenService_1 = require("../../util/tokenService");
// @ts-ignore
const auth_middleware_1 = require("../../middleware/auth.middleware");
// @ts-ignore
const role_middleware_1 = require("../../middleware/role.middleware");
const config = (0, config_1.configuration)();
const tokenService = new tokenService_1.TokenService(config);
const authMiddleware = new auth_middleware_1.AuthMiddleware(config, tokenService);
const roleMiddleware = new role_middleware_1.RoleMiddleware();
const router = (0, express_1.Router)();
/**
 * `liftToken` sets `'Authorization'` token to value from request body
 * `.shopValueInfo.value1` as we can't controll POST request header
 * that's caused by EasyPay page.
 */
function liftToken(req, _arg1, next) {
    var _a;
    if (req.headers['authorization']) {
        next();
        return;
    }
    const token = (_a = req.body.shopValue1) !== null && _a !== void 0 ? _a : null;
    if (req.body.shopValue1)
        req.headers['authorization'] = token;
    next();
}
router.get(preregister_credit_1.default.path, authMiddleware.checkToken(preregister_credit_1.default.checkToken), roleMiddleware.checkRoles(preregister_credit_1.default.roles), preregister_credit_1.default.validator, preregister_credit_1.default.service, preregister_credit_1.default.errorHandler);
router.post(register_credit_1.default.path, liftToken, authMiddleware.checkToken(register_credit_1.default.checkToken), roleMiddleware.checkRoles(register_credit_1.default.roles), register_credit_1.default.validator, register_credit_1.default.service, register_credit_1.default.errorHandler);
// TODO
module.exports = router;
