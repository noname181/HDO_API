const router = require('express').Router();
const { readMessageLogs, readMessageLogsById } = require('../../api/message-logs');

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
  readMessageLogs.path,
  authMiddleware.checkToken(readMessageLogs.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readMessageLogs.roles, readMessageLogs.permissions, readMessageLogs.checkToken),
  readMessageLogs.validator,
  readMessageLogs.service,
  readMessageLogs.errorHandler
);

router.get(
  readMessageLogsById.path,
  authMiddleware.checkToken(readMessageLogsById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readMessageLogsById.roles,
    readMessageLogsById.permissions,
    readMessageLogsById.checkToken
  ),
  readMessageLogsById.validator,
  readMessageLogsById.service,
  readMessageLogsById.errorHandler
);

module.exports = router;
