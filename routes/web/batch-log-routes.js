const router = require('express').Router();
const { listBatchLog, wsLog } = require('../../api/batch-log');

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
  listBatchLog.path,
  authMiddleware.checkToken(listBatchLog.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listBatchLog.roles, listBatchLog.permissions, listBatchLog.checkToken),
  listBatchLog.validator,
  listBatchLog.service,
  listBatchLog.errorHandler
);

router.post(
  wsLog.path,
  authMiddleware.checkToken(wsLog.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(wsLog.roles, wsLog.permissions, wsLog.checkToken),
  wsLog.validator,
  wsLog.service,
  wsLog.errorHandler
);

module.exports = router;
