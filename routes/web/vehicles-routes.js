const router = require('express').Router();
const { listVehicle, deleteBatchVehicles, updateVehiclePnC, deleteVehicle } = require('../../api/vehicle');

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
  listVehicle.path,
  authMiddleware.checkToken(listVehicle.checkToken),
  //userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listVehicle.roles, listVehicle.permissions, listVehicle.checkToken),
  listVehicle.validator,
  listVehicle.service,
  listVehicle.errorHandler
);

router.put(
  updateVehiclePnC.path,
  authMiddleware.checkToken(updateVehiclePnC.checkToken),
  //userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateVehiclePnC.roles, updateVehiclePnC.permissions, updateVehiclePnC.checkToken),
  updateVehiclePnC.validator,
  updateVehiclePnC.service,
  updateVehiclePnC.errorHandler
);

router.delete(
  '/vehicles/delete-batch',
  authMiddleware.checkToken(deleteBatchVehicles.checkToken),
  //userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    deleteBatchVehicles.roles,
    deleteBatchVehicles.permissions,
    deleteBatchVehicles.checkToken
  ),
  deleteBatchVehicles.validator,
  deleteBatchVehicles.service,
  deleteBatchVehicles.errorHandler
);

router.delete(
  '/vehicles-delete-one/:vehiclesId',
  authMiddleware.checkToken(deleteVehicle.checkToken),
  //userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteVehicle.roles, deleteVehicle.permissions, deleteVehicle.checkToken),
  deleteVehicle.validator,
  deleteVehicle.service,
  deleteVehicle.errorHandler
);

module.exports = router;
