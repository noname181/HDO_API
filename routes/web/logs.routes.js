"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsRoutes = void 0;
const express_1 = require("express");
const config_1 = require("../../config/config");
const tokenService_1 = require("../../util/tokenService");
const newRole_middleware_1 = require("../../middleware/newRole.middleware");
const getLogCloudWatch_1 = require("../../controllers/webAdminControllers/logControllers/getLogCloudWatch");
const user_action_logger_1 = require("../../middleware/user-action-logger");
const exceptionAsyncService_1 = require("../../util/exceptionAsyncService");
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const logsRoutes = () => {
    const router = (0, express_1.Router)();
    const config = (0, config_1.configuration)();
    const tokenService = new tokenService_1.TokenService(config);
    const authMiddleware = new AuthMiddleware(config, tokenService);
    const newRoleMiddleware = new newRole_middleware_1.NewRoleMiddleware();
    router.get(getLogCloudWatch_1.getLogCloudWatch.path, authMiddleware.checkToken(getLogCloudWatch_1.getLogCloudWatch.checkToken), (0, user_action_logger_1.userActionLogMiddleware)(false), newRoleMiddleware.checkRoles(getLogCloudWatch_1.getLogCloudWatch.roles, getLogCloudWatch_1.getLogCloudWatch.permissions, getLogCloudWatch_1.getLogCloudWatch.checkToken), (0, exceptionAsyncService_1.exceptionAsyncService)(getLogCloudWatch_1.getLogCloudWatch.service));
    return router;
};
exports.logsRoutes = logsRoutes;
