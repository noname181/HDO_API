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
exports.deleteRoles = void 0;
const newRole_middleware_1 = require("../../../../middleware/newRole.middleware");
const tokenService_1 = require("../../../../util/tokenService");
const loggerService_1 = require("../../../../services/loggerService/loggerService");
const models = require('../../../../models');
exports.deleteRoles = {
    path: '/web/auth/roles',
    method: 'delete',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [newRole_middleware_1.PERMISSIONS.delete],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loggerService = new loggerService_1.LoggerService();
        const { query, user: authUser } = request;
        let ids = [];
        if (query.ids) {
            ids = query.ids
                .toString()
                .replace(/[\[\]\"\']/g, '')
                .split(',');
        }
        try {
            yield models.sequelize.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all(ids.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const role = yield models.Role.findOne({
                        where: {
                            id: item,
                        },
                        include: [
                            {
                                model: models.UsersNew,
                                as: 'users',
                                paranoid: false,
                            },
                        ],
                        transaction: t,
                        paranoid: false,
                    });
                    if (!role) {
                        throw 'ROLE_ID_NOT_FOUND';
                    }
                    const checkDeleteRole = role.users ? role.users.some((item) => !item.deletedAt) : false;
                    if (checkDeleteRole) {
                        throw 'ROLE_IS_ACTIVE';
                    }
                    yield role.destroy({ transaction: t }, { force: true });
                })));
            }));
            return response.status(newRole_middleware_1.HTTP_STATUS_CODE.NO_CONTENT).json({});
        }
        catch (error) {
            loggerService.error('Delete Roles by admin::', error);
            if (error instanceof Error) {
                next('ERROR_WHILE_DELETE');
            }
            next(error);
        }
    });
}
function validator(request, response, next) {
    next();
}
function errorHandler(error, request, response, next) {
    if (error === 'ROLE_ID_NOT_FOUND') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '역할을 찾을 수 없습니다.',
        });
    }
    if (error === 'ROLE_IS_ACTIVE') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '권한이 할당되어 있는 유저정보가 있습니다. 해당 권한을 삭제할수 없습니다.',
        });
    }
    if (error === 'ERROR_WHILE_DELETE') {
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.CONFLICT).json({
            errorCode: error,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: '작성되지 않았습니다.',
        });
    }
    next();
}
