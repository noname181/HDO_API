const router = require('express').Router();
const { create, read, readById, updateById, deleteById, runCrontab } = require('../../api/sb-unitprice-change-reservation');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

router.post(
  create.path,
  authMiddleware.checkToken(create.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    create.roles,
    create.permissions,
    create.checkToken
  ),
  create.validator,
  create.service,
  create.errorHandler
);

router.post(
  runCrontab.path,
  authMiddleware.checkToken(runCrontab.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    runCrontab.roles,
    runCrontab.permissions,
    runCrontab.checkToken
  ),
  runCrontab.validator,
  runCrontab.service,
  runCrontab.errorHandler
);
 
router.get(
  read.path,
  authMiddleware.checkToken(read.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    read.roles,
    read.permissions,
    read.checkToken
  ),
  read.validator,
  read.service,
  read.errorHandler
);

router.get(
  readById.path,
  authMiddleware.checkToken(readById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readById.roles,
    readById.permissions,
    readById.checkToken
  ),
  readById.validator,
  readById.service,
  readById.errorHandler
);

router.put(
  updateById.path,
  authMiddleware.checkToken(updateById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    updateById.roles,
    updateById.permissions,
    updateById.checkToken
  ),
  updateById.validator,
  updateById.service,
  updateById.errorHandler
);

router.delete(
  deleteById.path,
  authMiddleware.checkToken(deleteById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    deleteById.roles,
    deleteById.permissions,
    deleteById.checkToken
  ),
  deleteById.validator,
  deleteById.service,
  deleteById.errorHandler
);

module.exports = router;
