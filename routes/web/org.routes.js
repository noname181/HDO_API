const router = require('express').Router();

const { configuration } = require('../../config/config');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { TokenService } = require('../../util/tokenService');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');
const {
  getUserExternalByOrgId,
} = require('../../controllers/webAdminControllers/org/getUserExternalByOrgId/getUserExternalByOrgId');
const {
  getUserRequestsByOrgId,
} = require('../../controllers/webAdminControllers/org/getUserRequestsByOrgId/getUserRequestsByOrgId');
const insertOrUpdateDataFromSapEvstation = require('../../api/organization/sync-org-from-sap-evstation');
const insertOrUpdateDataFromSapOilStation = require('../../api/organization/sync-org-from-sap-oil-station');

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

// * /web/orgs/:id/users router
router.get(
  getUserExternalByOrgId.path,
  authMiddleware.checkToken(getUserExternalByOrgId.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    getUserExternalByOrgId.roles,
    getUserExternalByOrgId.permissions,
    getUserExternalByOrgId.checkToken
  ),
  getUserExternalByOrgId.validator,
  getUserExternalByOrgId.service,
  getUserExternalByOrgId.errorHandler
);

// get user external request
router.get(
  getUserRequestsByOrgId.path,
  authMiddleware.checkToken(getUserRequestsByOrgId.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    getUserRequestsByOrgId.roles,
    getUserRequestsByOrgId.permissions,
    getUserRequestsByOrgId.checkToken
  ),
  getUserRequestsByOrgId.validator,
  getUserRequestsByOrgId.service,
  getUserRequestsByOrgId.errorHandler
);

router.get(
  insertOrUpdateDataFromSapEvstation.path,
  authMiddleware.checkToken(insertOrUpdateDataFromSapEvstation.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    insertOrUpdateDataFromSapEvstation.roles,
    insertOrUpdateDataFromSapEvstation.permissions,
    insertOrUpdateDataFromSapEvstation.checkToken
  ),
  insertOrUpdateDataFromSapEvstation.validator,
  insertOrUpdateDataFromSapEvstation.service,
  insertOrUpdateDataFromSapEvstation.errorHandler
);

router.get(
  insertOrUpdateDataFromSapOilStation.path,
  authMiddleware.checkToken(insertOrUpdateDataFromSapOilStation.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    insertOrUpdateDataFromSapOilStation.roles,
    insertOrUpdateDataFromSapOilStation.permissions,
    insertOrUpdateDataFromSapOilStation.checkToken
  ),
  insertOrUpdateDataFromSapOilStation.validator,
  insertOrUpdateDataFromSapOilStation.service,
  insertOrUpdateDataFromSapOilStation.errorHandler
);

module.exports = router;
