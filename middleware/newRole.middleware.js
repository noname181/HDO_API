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
exports.NewRoleMiddleware = exports.PERMISSIONS = exports.HTTP_STATUS_CODE = void 0;
const permission_constraints_1 = require("../util/permission.constraints");
const tokenService_1 = require("../util/tokenService");
const models = require('../models');
const USER_ROLE = {
    HDO: 'hdo',
    EXTERNAL: 'org',
    MOBILE: 'mobile',
    ALL: 'all',
};
var HTTP_STATUS_CODE;
(function (HTTP_STATUS_CODE) {
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["OK"] = 200] = "OK";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["NO_CONTENT"] = 204] = "NO_CONTENT";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["CREATE"] = 201] = "CREATE";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["UN_AUTHORIZED"] = 401] = "UN_AUTHORIZED";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["FORBIDDEN"] = 403] = "FORBIDDEN";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["CONFLICT"] = 409] = "CONFLICT";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["NOT_FOUND"] = 404] = "NOT_FOUND";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HTTP_STATUS_CODE[HTTP_STATUS_CODE["SERVICE_UN_AVAILABLE"] = 503] = "SERVICE_UN_AVAILABLE";
})(HTTP_STATUS_CODE || (exports.HTTP_STATUS_CODE = HTTP_STATUS_CODE = {}));
var PERMISSIONS;
(function (PERMISSIONS) {
    PERMISSIONS["list"] = "list";
    PERMISSIONS["read"] = "read";
    PERMISSIONS["write"] = "write";
    PERMISSIONS["delete"] = "delete";
})(PERMISSIONS || (exports.PERMISSIONS = PERMISSIONS = {}));
class NewRoleMiddleware {
    checkRoles(roles = [], permissions = [], isCheckToken) {
        return (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            if (!isCheckToken || roles.length === 0) {
                request.privateView = true;
                return next();
            }
            const { user: authUser, headers, method } = request;
            if (!authUser) {
                return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                    errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message: '사용자가 가지고 있는 권한 중 해당 기능의 허가가 되어있지 않습니다.',
                });
            }
            const checkMobileRole = roles.includes(tokenService_1.USER_TYPE.MOBILE);
            const checkUserType = authUser.type.toUpperCase() === tokenService_1.USER_TYPE.MOBILE.toUpperCase() && checkMobileRole;
            if (checkUserType) {
                request.privateView = true;
                return next();
            }
            const user = yield models.UsersNew.findByPk(authUser.id, {
                include: [
                    {
                        model: models.Role,
                    },
                ],
            });
            if (!user || !user.Role) {
                return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                    errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message: '사용자가 가지고 있는 권한 중 해당 기능의 허가가 되어있지 않습니다.',
                });
            }
            const page = headers['location'] || '';
            const permissionPage = Object.entries(permission_constraints_1.PERMISSION_PAGE).find(([key, value]) => value === page);
            const permissionPageKey = permissionPage ? permissionPage[0] : '';
            const permissionName = Object.entries(permission_constraints_1.PERMISSION_NAME).find(([key, value]) => key === permissionPageKey);
            const permissionNameValue = permissionName ? permissionName[1] : '';
            const listRole = user.Role.listPermission
                ? user.Role.listPermission.some((item) => item === permissionNameValue)
                : false;
            const readRole = user.Role.readPermission
                ? user.Role.readPermission.some((item) => item === permissionNameValue)
                : false;
            const writeRole = user.Role.writePermission
                ? user.Role.writePermission.some((item) => item === permissionNameValue)
                : false;
            const deleteRole = user.Role.deletePermission
                ? user.Role.deletePermission.some((item) => item === permissionNameValue)
                : false;
            if (!listRole && !readRole && !writeRole && !deleteRole) {
                return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                    errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message: '보기 페이지를 열람할 권한이 없습니다.',
                });
            }
            if (deleteRole) {
                request.privateView = true;
                return next();
            }
            if (method === 'DELETE') {
                return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                    errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message: '사용자가 가지고 있는 권한 중 해당 기능의 허가가 되어있지 않습니다.',
                });
            }
            const writePermission = ['PUT', 'POST', 'PATCH'].includes(method);
            if (!writeRole && writePermission) {
                return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                    errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message: '이 기능을 사용할 권한이 없습니다.',
                });
            }
            request.privateView = writeRole || readRole ? true : false;
            next();
        });
    }
}
exports.NewRoleMiddleware = NewRoleMiddleware;
