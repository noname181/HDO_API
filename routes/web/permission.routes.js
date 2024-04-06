"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const config_1 = require("../../config/config");
const tokenService_1 = require("../../util/tokenService");
const newRole_middleware_1 = require("../../middleware/newRole.middleware");
const listPermissionPage_1 = require("../../controllers/webAdminControllers/permissions/listPermissionPage/listPermissionPage");
const listRoles_1 = require("../../controllers/webAdminControllers/permissions/listRoles/listRoles");
const createRole_1 = require("../../controllers/webAdminControllers/permissions/createRole/createRole");
const updateRoleById_1 = require("../../controllers/webAdminControllers/permissions/updateRoleById/updateRoleById");
const readRoleById_1 = require("../../controllers/webAdminControllers/permissions/readRoleById/readRoleById");
const deleteRoles_1 = require("../../controllers/webAdminControllers/permissions/deleteRoles/deleteRoles");
const user_action_logger_1 = require("../../middleware/user-action-logger");
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const permissionRoutes = () => {
    const router = express_1.default.Router();
    const config = (0, config_1.configuration)();
    const tokenService = new tokenService_1.TokenService(config);
    const authMiddleware = new AuthMiddleware(config, tokenService);
    const newRoleMiddleware = new newRole_middleware_1.NewRoleMiddleware();
    // * list permissions /web/auth/permissions
    router.get(listPermissionPage_1.listPermissionPage.path, authMiddleware.checkToken(listPermissionPage_1.listPermissionPage.checkToken), newRoleMiddleware.checkRoles(listPermissionPage_1.listPermissionPage.roles, listPermissionPage_1.listPermissionPage.permissions, listPermissionPage_1.listPermissionPage.checkToken), (0, user_action_logger_1.userActionLogMiddleware)(false), listPermissionPage_1.listPermissionPage.validator, listPermissionPage_1.listPermissionPage.service, listPermissionPage_1.listPermissionPage.errorHandler);
    // * list roles /web/auth/roles
    router.get(listRoles_1.listRoles.path, authMiddleware.checkToken(listRoles_1.listRoles.checkToken), newRoleMiddleware.checkRoles(listRoles_1.listRoles.roles, listRoles_1.listRoles.permissions, listRoles_1.listRoles.checkToken), (0, user_action_logger_1.userActionLogMiddleware)(false), listRoles_1.listRoles.validator, listRoles_1.listRoles.service, listRoles_1.listRoles.errorHandler);
    // * create role /web/auth/roles
    router.post(createRole_1.createRole.path, authMiddleware.checkToken(createRole_1.createRole.checkToken), newRoleMiddleware.checkRoles(createRole_1.createRole.roles, createRole_1.createRole.permissions, createRole_1.createRole.checkToken), (0, user_action_logger_1.userActionLogMiddleware)(false), createRole_1.createRole.validator, createRole_1.createRole.service, createRole_1.createRole.errorHandler);
    // * update role /web/auth/roles/:id
    router.put(updateRoleById_1.updateRoleById.path, authMiddleware.checkToken(updateRoleById_1.updateRoleById.checkToken), newRoleMiddleware.checkRoles(updateRoleById_1.updateRoleById.roles, updateRoleById_1.updateRoleById.permissions, updateRoleById_1.updateRoleById.checkToken), (0, user_action_logger_1.userActionLogMiddleware)(false), updateRoleById_1.updateRoleById.validator, updateRoleById_1.updateRoleById.service, updateRoleById_1.updateRoleById.errorHandler);
    // * read role by id /web/auth/role/:id
    router.get(readRoleById_1.readRoleById.path, authMiddleware.checkToken(readRoleById_1.readRoleById.checkToken), newRoleMiddleware.checkRoles(readRoleById_1.readRoleById.roles, readRoleById_1.readRoleById.permissions, readRoleById_1.readRoleById.checkToken), (0, user_action_logger_1.userActionLogMiddleware)(false), readRoleById_1.readRoleById.validator, readRoleById_1.readRoleById.service, readRoleById_1.readRoleById.errorHandler);
    router.delete(deleteRoles_1.deleteRoles.path, authMiddleware.checkToken(deleteRoles_1.deleteRoles.checkToken), newRoleMiddleware.checkRoles(deleteRoles_1.deleteRoles.roles, deleteRoles_1.deleteRoles.permissions, deleteRoles_1.deleteRoles.checkToken), (0, user_action_logger_1.userActionLogMiddleware)(false), deleteRoles_1.deleteRoles.validator, deleteRoles_1.deleteRoles.service, deleteRoles_1.deleteRoles.errorHandler);
    return router;
};
exports.permissionRoutes = permissionRoutes;
