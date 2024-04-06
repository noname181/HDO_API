"use strict";
/**
 * Created by Sarc Bae on 2021-06-23.
 * Modified by Jackie Yoon on 2023-06-14.
 * Root API Router Finder
 * 이 미들웨어 설정시 정의한 Path에 담겨있는 API파일들을 따로 등록 하지 않아도 자동으로 등록하게 하는 미들웨어
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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config/config");
const tokenService_1 = require("../util/tokenService");
const newRole_middleware_1 = require("./newRole.middleware");
const user_action_logger_1 = require("./user-action-logger");
const { AuthMiddleware } = require('./auth.middleware');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const rootPath = path.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || ((_b = process.mainModule) === null || _b === void 0 ? void 0 : _b.filename) || '');
module.exports = (startPath, routerFileFilter) => {
    console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}]` + ' API Router Module Load...', '\n');
    fromDir(startPath, routerFileFilter);
    console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}]` + ' API Router Module Loaded', '\n');
    return router;
};
const blacklist = ['paymethod'];
function fromDir(apiPath, filter) {
    if (!fs.existsSync(apiPath)) {
        return;
    }
    const files = fs.readdirSync(apiPath);
    files
        .map((file) => path.join(apiPath, file))
        .forEach((filename) => {
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            /**
             * TODO bad solution for worse code
             * Automatic router registration based on filename breaks a lot of things IMO
             * We need better way to register router.
             */
            if (blacklist.includes(path.basename(filename)))
                console.log('skipping directory ', filename);
            else
                fromDir(filename, filter);
        }
        else if (filename.indexOf(filter) >= 0) {
            if (filename.includes('index.js')) {
                return null;
            }
            const apiDirPath = rootPath + '/' + filename;
            console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + filename);
            const api = require(apiDirPath);
            try {
                routerRegister(api);
            }
            catch (e) {
                console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ${e}`, '\n');
            }
        }
    });
}
// New logic authen with JWT
const config = (0, config_1.configuration)();
const tokenService = new tokenService_1.TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const newRoleMiddleware = new newRole_middleware_1.NewRoleMiddleware();
function routerRegister(api) {
    // console.log("api path 점검",api.path == '/terms')
    switch (api.method.toUpperCase()) {
        case 'GET':
            router.get(api.path, api.checkToken === true
                ? authMiddleware.checkToken(api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), api.checkToken === true
                ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), (0, user_action_logger_1.userActionLogMiddleware)(api.logDisable), api.validator, api.service, api.errorHandler);
            // router.get(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
            break;
        case 'POST':
            if (api.multer) {
                router.post(api.path, api.checkToken === true
                    ? authMiddleware.checkToken(api.checkToken)
                    : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                        return next();
                    }), api.checkToken === true
                    ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
                    : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                        return next();
                    }), (0, user_action_logger_1.userActionLogMiddleware)(api.logDisable), api.multer, api.validator, api.service, api.errorHandler);
                // router.post(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.multer, api.validator, api.service, api.errorHandler);
                break;
            }
            router.post(api.path, api.checkToken === true
                ? authMiddleware.checkToken(api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), api.checkToken === true
                ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), (0, user_action_logger_1.userActionLogMiddleware)(api.logDisable), api.validator, api.service, api.errorHandler);
            // router.post(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
            break;
        case 'PUT':
            if (api.multer) {
                router.put(api.path, api.checkToken === true
                    ? authMiddleware.checkToken(api.checkToken)
                    : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                        return next();
                    }), api.checkToken === true
                    ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
                    : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                        return next();
                    }), (0, user_action_logger_1.userActionLogMiddleware)(api.logDisable), api.multer, api.validator, api.service, api.errorHandler);
                // router.put(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.multer, api.validator, api.service, api.errorHandler);
            }
            router.put(api.path, api.checkToken === true
                ? authMiddleware.checkToken(api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), api.checkToken === true
                ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), (0, user_action_logger_1.userActionLogMiddleware)(api.logDisable), api.validator, api.service, api.errorHandler);
            // router.put(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
            break;
        case 'DELETE':
            router.delete(api.path, api.checkToken === true
                ? authMiddleware.checkToken(api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), api.checkToken === true
                ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), (0, user_action_logger_1.userActionLogMiddleware)(api.logDisable), api.validator, api.service, api.errorHandler);
            // router.delete(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
            break;
        case 'PATCH':
            router.patch(api.path, api.checkToken === true
                ? authMiddleware.checkToken(api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), api.checkToken === true
                ? newRoleMiddleware.checkRoles(api.roles, api.permissions, api.checkToken)
                : (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                    return next();
                }), (0, user_action_logger_1.userActionLogMiddleware)(api.logDisable), api.validator, api.service, api.errorHandler);
            // router.patch(api.path, roleCheck(api.roles), userActionLoger(api.logDisable, api.logDisableProperties), api.validator, api.service, api.errorHandler);
            break;
    }
}
