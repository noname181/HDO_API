const router = require('express').Router();
const { getMe } = require('../../controllers/webAdminControllers/user/getMe/getMe');
const { getUsers } = require('../../controllers/webAdminControllers/user/getUsers/getUsers');
const { deleteMultiUsers } = require('../../controllers/webAdminControllers/user/deleteMultiUsers/deleteMultiUsers');
const {
  syncUserFromSapPerson,
} = require('../../controllers/webAdminControllers/user/sync-from-sap-person/sync-user-from-sap-person');
const getUserLogs = require('../../api/user-log/read-user-log');

const { configuration } = require('../../config/config');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { TokenService } = require('../../util/tokenService');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { updateUserByAdmin } = require('../../controllers/webAdminControllers/user/updateUserByAdmin/updateUserByAdmin');
const { getUserById } = require('../../controllers/webAdminControllers/user/getUserById/getUserById');
const { permissionMiddleware } = require('../../middleware/permission.middleware');
const { createMobileUser } = require('../../controllers/webAdminControllers/user/createMobileUser/createMobileUser');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');
const { exceptionAsyncService } = require('../../util/exceptionAsyncService');

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

router.get(getMe.path, authMiddleware.checkToken(getMe.checkToken), getMe.validator, getMe.service, getMe.errorHandler);

router.get(
  getUsers.path,
  authMiddleware.checkToken(getUsers.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(getUsers.roles, getUsers.permissions, getUsers.checkToken),
  getUsers.validator,
  getUsers.service,
  getUsers.errorHandler
);

// update user by admin
router.put(
  updateUserByAdmin.path,
  authMiddleware.checkToken(updateUserByAdmin.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateUserByAdmin.roles, updateUserByAdmin.permissions, updateUserByAdmin.checkToken),
  updateUserByAdmin.validator,
  exceptionAsyncService(updateUserByAdmin.service),
  updateUserByAdmin.errorHandler
);

// get user detail
router.get(
  getUserById.path,
  authMiddleware.checkToken(getUserById.checkToken),
  userActionLogMiddleware(false, getUserById.status),
  newRoleMiddleware.checkRoles(getUserById.roles, getUserById.permissions, getUserById.checkToken),
  getUserById.validator,
  getUserById.service,
  getUserById.errorHandler
);

// delete multi users
router.delete(
  deleteMultiUsers.path,
  authMiddleware.checkToken(deleteMultiUsers.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteMultiUsers.roles, deleteMultiUsers.permissions, deleteMultiUsers.checkToken),
  deleteMultiUsers.validator,
  deleteMultiUsers.service,
  deleteMultiUsers.errorHandler
);

router.post(
  createMobileUser.path,
  authMiddleware.checkToken(createMobileUser.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createMobileUser.roles, createMobileUser.permissions, createMobileUser.checkToken),
  createMobileUser.validator,
  createMobileUser.service,
  createMobileUser.errorHandler
);

router.get(
  getUserLogs.path,
  authMiddleware.checkToken(getUserLogs.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(getUserLogs.roles, getUserLogs.permissions, getUserLogs.checkToken),
  getUserLogs.validator,
  getUserLogs.service,
  getUserLogs.errorHandler
);

router.get(
  syncUserFromSapPerson.path,
  authMiddleware.checkToken(syncUserFromSapPerson.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    syncUserFromSapPerson.roles,
    syncUserFromSapPerson.permissions,
    syncUserFromSapPerson.checkToken
  ),
  syncUserFromSapPerson.validator,
  syncUserFromSapPerson.service,
  syncUserFromSapPerson.errorHandler
);

module.exports = router;
