const router = require('express').Router();
const {
  listAction,
  createAction,
  readAction,
  updateAction,
  deleteAction,
  deleteBatchAction,
  readNoticeActive,
} = require('../../api/web-notice');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');
// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const newRoleMiddleware = new NewRoleMiddleware();

router.get(
  listAction.path,
  authMiddleware.checkToken(listAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listAction.roles, listAction.permissions, listAction.checkToken),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);

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
  readNoticeActive.path,
  authMiddleware.checkToken(readNoticeActive.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readNoticeActive.roles, readNoticeActive.permissions, readNoticeActive.checkToken),
  readNoticeActive.validator,
  readNoticeActive.service,
  readNoticeActive.errorHandler
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
  deleteBatchAction.path,
  authMiddleware.checkToken(deleteBatchAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteBatchAction.roles, deleteBatchAction.permissions, deleteBatchAction.checkToken),
  deleteBatchAction.validator,
  deleteBatchAction.service,
  deleteBatchAction.errorHandler
);

router.delete(
  deleteAction.path,
  authMiddleware.checkToken(deleteAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteAction.roles, deleteAction.permissions, deleteAction.checkToken),
  deleteAction.validator,
  deleteAction.service,
  deleteAction.errorHandler
);

module.exports = router;
