const router = require('express').Router();
const readSapPersonById = require('../../api/sapPerson/read-sap-person-by-id');
const readSapPerson = require('../../api/sapPerson/read-sap-person');

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
  readSapPerson.path,
  authMiddleware.checkToken(readSapPerson.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readSapPerson.roles, readSapPerson.permissions, readSapPerson.checkToken),
  readSapPerson.validator,
  readSapPerson.service,
  readSapPerson.errorHandler
);

router.get(
  readSapPersonById.path,
  authMiddleware.checkToken(readSapPersonById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readSapPersonById.roles, readSapPersonById.permissions, readSapPersonById.checkToken),
  readSapPersonById.validator,
  readSapPersonById.service,
  readSapPersonById.errorHandler
);

module.exports = router;
