const router = require('express').Router();
const { readPaymentNotificationByCno } = require('../../api/payment-notifications');

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
  readPaymentNotificationByCno.path,
  authMiddleware.checkToken(readPaymentNotificationByCno.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readPaymentNotificationByCno.roles,
    readPaymentNotificationByCno.permissions,
    readPaymentNotificationByCno.checkToken
  ),
  readPaymentNotificationByCno.validator,
  readPaymentNotificationByCno.service,
  readPaymentNotificationByCno.errorHandler
);

module.exports = router;
