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
exports.createRole = void 0;
const newRole_middleware_1 = require("../../../../middleware/newRole.middleware");
const permission_constraints_1 = require("../../../../util/permission.constraints");
const lodash_1 = require("../../../../util/lodash");
const idGenerator_1 = require("../../../../util/idGenerator");
const listRoles_1 = require("../listRoles/listRoles");
const tokenService_1 = require("../../../../util/tokenService");
const models = require('../../../../models');
exports.createRole = {
    path: '/web/auth/roles',
    method: 'post',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [newRole_middleware_1.PERMISSIONS.write],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user, body } = request;
        const hasRole = yield models.Role.findOne({
            where: {
                name: body.name,
            },
        });
        if (hasRole) {
            return next('ROLE_NAME_IS_EXISTS');
        }
        const id = (0, idGenerator_1.idGenerator)();
        try {
            const role = yield models.Role.create({
                id,
                name: body.name,
                mainMenu: body.mainMenu,
                listPermission: body.list,
                readPermission: body.read,
                writePermission: body.write,
                deletePermission: body.delete,
            });
            const roleRes = (0, listRoles_1.transformResponse)(role);
            return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json(roleRes);
        }
        catch (error) {
            return next('ERROR_WHILE_CREATE');
        }
    });
}
function validator(request, response, next) {
    const { body } = request;
    const permissions = Object.values(permission_constraints_1.PERMISSION_NAME);
    if (!body || !body.name) {
        throw 'INPUT_INVALID';
    }
    const roleName = body.name.toString().trim().toUpperCase() || '';
    if (!roleName) {
        throw 'INVALID_ROLE_NAME';
    }
    let list = [];
    if (body.list && Array.isArray(body.list)) {
        list = (0, lodash_1.remove)([...permissions], (item) => {
            return body.list.includes(item);
        });
    }
    let read = [];
    if (body.read && Array.isArray(body.read)) {
        read = (0, lodash_1.remove)([...permissions], (item) => {
            return body.read.includes(item);
        });
    }
    let write = [];
    if (body.write && Array.isArray(body.write)) {
        write = (0, lodash_1.remove)([...permissions], (item) => {
            return body.write.includes(item);
        });
    }
    let deletePermissions = [];
    if (body.delete && Array.isArray(body.delete)) {
        deletePermissions = (0, lodash_1.remove)([...permissions], (item) => {
            return body.delete.includes(item);
        });
    }
    request.body = Object.assign(Object.assign({}, request.body), { name: roleName, list,
        read,
        write, delete: deletePermissions });
    next();
}
function errorHandler(error, request, response, next) {
    if (error === 'INPUT_INVALID') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '유효하지 않은 결제입니다.',
        });
    }
    if (error === 'INVALID_ROLE_NAME') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '역할 이름이 잘못되었습니다.',
        });
    }
    if (error === 'ROLE_NAME_IS_EXISTS') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '역할 이름이 존재합니다.',
        });
    }
    if (error === 'ERROR_WHILE_CREATE') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.CONFLICT).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '작성되지 않았습니다.',
        });
    }
    next();
}
