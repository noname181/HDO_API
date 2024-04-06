const router = require('express').Router();
const {
  readAction,
  readByIdAction,
  updateAction,
  deleteByIdAction,
  deleteByIdsAction,
  createAction,
} = require('../../api/msTemplate');

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
  readAction.path,
  authMiddleware.checkToken(readAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readAction.roles, readAction.permissions, readAction.checkToken),
  readAction.validator,
  readAction.service,
  readAction.errorHandler
);

router.get(
  readByIdAction.path,
  authMiddleware.checkToken(readByIdAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readByIdAction.roles, readByIdAction.permissions, readByIdAction.checkToken),
  readByIdAction.validator,
  readByIdAction.service,
  readByIdAction.errorHandler
);

router.put(
  updateAction.path,
  authMiddleware.checkToken(updateAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateAction.roles, updateAction.permissions, updateAction.checkToken),
  updateAction.validator,
  updateAction.service,
  updateAction.errorHandler
);

router.delete(
  deleteByIdsAction.path,
  authMiddleware.checkToken(deleteByIdsAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteByIdsAction.roles, deleteByIdsAction.permissions, deleteByIdsAction.checkToken),
  deleteByIdsAction.validator,
  deleteByIdsAction.service,
  deleteByIdsAction.errorHandler
);

router.delete(
  deleteByIdAction.path,
  authMiddleware.checkToken(deleteByIdAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteByIdAction.roles, deleteByIdAction.permissions, deleteByIdAction.checkToken),
  deleteByIdAction.validator,
  deleteByIdAction.service,
  deleteByIdAction.errorHandler
);

router.post(
  createAction.path,
  authMiddleware.checkToken(createAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createAction.roles, createAction.permissions, createAction.checkToken),
  createAction.validator,
  createAction.service,
  createAction.errorHandler
);

module.exports = router;
