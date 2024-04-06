const router = require('express').Router();
const { deleteChargerStationByIds } = require('../../api/charging-station');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');
const { getStationById } = require('../../controllers/webAdminControllers/stations/getStationById');
const { exceptionAsyncService } = require('../../util/exceptionAsyncService');
// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

router.get(
  getStationById.path,
  authMiddleware.checkToken(getStationById.checkToken),
  userActionLogMiddleware(),
  newRoleMiddleware.checkRoles(getStationById.roles, getStationById.permissions, getStationById.checkToken),
  exceptionAsyncService(getStationById.service)
);

router.delete(
  deleteChargerStationByIds.path,
  authMiddleware.checkToken(deleteChargerStationByIds.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    deleteChargerStationByIds.roles,
    deleteChargerStationByIds.permissions,
    deleteChargerStationByIds.checkToken
  ),
  deleteChargerStationByIds.validator,
  deleteChargerStationByIds.service,
  deleteChargerStationByIds.errorHandler
);

module.exports = router;
