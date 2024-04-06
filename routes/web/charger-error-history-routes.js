const router = require('express').Router();
const { readChargerErrorHistory } = require('../../api/chargerErrorHistory');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

router.get(
  readChargerErrorHistory.path,
  authMiddleware.checkToken(readChargerErrorHistory.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readChargerErrorHistory.roles,
    readChargerErrorHistory.permissions,
    readChargerErrorHistory.checkToken
  ),
  readChargerErrorHistory.validator,
  readChargerErrorHistory.service,
  readChargerErrorHistory.errorHandler
);

module.exports = router;
