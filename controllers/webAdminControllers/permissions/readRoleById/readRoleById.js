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
exports.readRoleById = void 0;
const newRole_middleware_1 = require("../../../../middleware/newRole.middleware");
const listRoles_1 = require("../listRoles/listRoles");
const tokenService_1 = require("../../../../util/tokenService");
const models = require('../../../../models');
exports.readRoleById = {
    path: '/web/auth/roles/:id',
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [newRole_middleware_1.PERMISSIONS.list, newRole_middleware_1.PERMISSIONS.read],
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
        const roleRes = (0, listRoles_1.transformResponse)(role);
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json(roleRes);
    });
}
function validator(request, response, next) {
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
    next();
}
