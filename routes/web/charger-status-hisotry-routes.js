const router = require('express').Router();
const { readChargerStatusHistory } = require('../../api/chargerStatusHistory');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');
// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

router.get(
  readChargerStatusHistory.path,
  authMiddleware.checkToken(readChargerStatusHistory.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readChargerStatusHistory.roles,
    readChargerStatusHistory.permissions,
    readChargerStatusHistory.checkToken
  ),
  readChargerStatusHistory.validator,
  readChargerStatusHistory.service,
  readChargerStatusHistory.errorHandler
);

module.exports = router;
