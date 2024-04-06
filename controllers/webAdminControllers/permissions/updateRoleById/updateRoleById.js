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
exports.updateRoleById = void 0;
const newRole_middleware_1 = require("../../../../middleware/newRole.middleware");
const permission_constraints_1 = require("../../../../util/permission.constraints");
const lodash_1 = require("../../../../util/lodash");
const listRoles_1 = require("../listRoles/listRoles");
const tokenService_1 = require("../../../../util/tokenService");
const models = require('../../../../models');
exports.updateRoleById = {
    path: '/web/auth/roles/:id',
    method: 'put',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [newRole_middleware_1.PERMISSIONS.write],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { params, body } = request;
        const roleId = params.id.toString().trim() || '';
        const role = yield models.Role.findByPk(roleId);
        if (!role) {
            return next('ROLE_IS_NOT_EXISTS');
        }
        try {
            yield models.Role.update({
                listPermission: body.list,
                readPermission: body.read,
                writePermission: body.write,
                deletePermission: body.delete,
                mainMenu: body.mainMenu,
            }, {
                where: {
                    id: role.id,
                },
            });
            const roleUpdated = yield role.reload();
            const roleRes = (0, listRoles_1.transformResponse)(roleUpdated);
            return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json(roleRes);
        }
        catch (error) {
            return next('ERROR_WHILE_UPDATE');
        }
    });
}
function validator(request, response, next) {
    const { body } = request;
    const permissions = Object.values(permission_constraints_1.PERMISSION_NAME);
    if (body && body.list && Array.isArray(body.list)) {
        const list = (0, lodash_1.remove)([...permissions], (item) => {
            return body.list.includes(item);
        });
        request.body = Object.assign(Object.assign({}, body), { list });
    }
    if (body && body.read && Array.isArray(body.read)) {
        const read = (0, lodash_1.remove)([...permissions], (item) => {
            return body.read.includes(item);
        });
        request.body = Object.assign(Object.assign({}, body), { read });
    }
    if (body && body.write && Array.isArray(body.write)) {
        const write = (0, lodash_1.remove)([...permissions], (item) => {
            return body.write.includes(item);
        });
        request.body = Object.assign(Object.assign({}, body), { write });
    }
    if (body && body.delete && Array.isArray(body.delete)) {
        const deletePermissions = (0, lodash_1.remove)([...permissions], (item) => {
            return body.delete.includes(item);
        });
        request.body = Object.assign(Object.assign({}, body), { delete: deletePermissions });
    }
    next();
}
function errorHandler(error, request, response, next) {
    if (error === 'ROLE_IS_NOT_EXISTS') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '역할이 존재하지 않습니다.',
        });
    }
    if (error === 'ERROR_WHILE_UPDATE') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '역할이 존재하지 않습니다.',
        });
    }
    next();
}
