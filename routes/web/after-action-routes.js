const router = require('express').Router();
const { createCostAction , createPaidAction} = require('../../api/afterAction');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');
const {Request, Response, NextFunction} = require("express");
// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

router.post(
    createCostAction.path,
    authMiddleware.checkToken(createCostAction.checkToken),
    userActionLogMiddleware(false),
    newRoleMiddleware.checkRoles(createCostAction.roles, createCostAction.permissions),
    createCostAction.validator,
    createCostAction.service,
    createCostAction.errorHandler
);

router.post(
  createPaidAction.path,
  authMiddleware.checkToken(createPaidAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createPaidAction.roles, createPaidAction.permissions),
  createPaidAction.validator,
  createPaidAction.service,
  createPaidAction.errorHandler
);

module.exports = router;
