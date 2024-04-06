const router = require('express').Router();
const {
  createVehicle,
  deleteVehicle,
  updateVehicle,
  listVehicle,
  detailVehicle,
  existVehiclePlate,
  listVehicleOfUserRequest,
} = require('../../api/vehicle');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

router.post(
  '/vehicles',
  authMiddleware.checkToken(createVehicle.checkToken),
  roleMiddleware.checkRoles(createVehicle.roles),
  createVehicle.validator,
  createVehicle.service,
  createVehicle.errorHandler
);

router.get(
  '/vehicles',
  authMiddleware.checkToken(listVehicle.checkToken),
  roleMiddleware.checkRoles(listVehicle.roles),
  listVehicle.validator,
  listVehicle.service,
  listVehicle.errorHandler
);
router.put(
  '/vehicles/:vehiclesId',
  authMiddleware.checkToken(updateVehicle.checkToken),
  roleMiddleware.checkRoles(updateVehicle.roles),
  updateVehicle.validator,
  updateVehicle.service,
  updateVehicle.errorHandler
);

router.get(
  '/vehicles/user',
  authMiddleware.checkToken(listVehicleOfUserRequest.checkToken),
  roleMiddleware.checkRoles(listVehicleOfUserRequest.roles),
  listVehicleOfUserRequest.validator,
  listVehicleOfUserRequest.service,
  listVehicleOfUserRequest.errorHandler
);

router.get(
  '/vehicles/:vehiclesId',
  authMiddleware.checkToken(detailVehicle.checkToken),
  roleMiddleware.checkRoles(detailVehicle.roles),
  detailVehicle.validator,
  detailVehicle.service,
  detailVehicle.errorHandler
);

router.get(
  '/exist-vehicles-plate',
  authMiddleware.checkToken(existVehiclePlate.checkToken),
  roleMiddleware.checkRoles(existVehiclePlate.roles),
  existVehiclePlate.validator,
  existVehiclePlate.service,
  existVehiclePlate.errorHandler
);

router.delete(
    "/vehicles/:vehiclesId",
    authMiddleware.checkToken(deleteVehicle.checkToken),
    roleMiddleware.checkRoles(deleteVehicle.roles),
    deleteVehicle.validator,
    deleteVehicle.service,
    deleteVehicle.errorHandler
);
module.exports = router;
