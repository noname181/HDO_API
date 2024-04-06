import express from 'express';
import { configuration } from '../../config/config';
import { TokenService } from '../../util/tokenService';
import { NewRoleMiddleware } from '../../middleware/newRole.middleware';
import { listPermissionPage } from '../../controllers/webAdminControllers/permissions/listPermissionPage/listPermissionPage';
import { listRoles } from '../../controllers/webAdminControllers/permissions/listRoles/listRoles';
import { createRole } from '../../controllers/webAdminControllers/permissions/createRole/createRole';
import { updateRoleById } from '../../controllers/webAdminControllers/permissions/updateRoleById/updateRoleById';
import { readRoleById } from '../../controllers/webAdminControllers/permissions/readRoleById/readRoleById';
import { deleteRoles } from '../../controllers/webAdminControllers/permissions/deleteRoles/deleteRoles';
import { userActionLogMiddleware } from '../../middleware/user-action-logger';
const { AuthMiddleware } = require('../../middleware/auth.middleware');

export const permissionRoutes = () => {
  const router = express.Router();
  const config = configuration();
  const tokenService = new TokenService(config);
  const authMiddleware = new AuthMiddleware(config, tokenService);
  const newRoleMiddleware = new NewRoleMiddleware();

  // * list permissions /web/auth/permissions
  router.get(
    listPermissionPage.path,
    authMiddleware.checkToken(listPermissionPage.checkToken),
    newRoleMiddleware.checkRoles(listPermissionPage.roles, listPermissionPage.permissions, listPermissionPage.checkToken),
    userActionLogMiddleware(false),
    listPermissionPage.validator,
    listPermissionPage.service,
    listPermissionPage.errorHandler
  );

  // * list roles /web/auth/roles
  router.get(
    listRoles.path,
    authMiddleware.checkToken(listRoles.checkToken),
    newRoleMiddleware.checkRoles(listRoles.roles, listRoles.permissions, listRoles.checkToken),
    userActionLogMiddleware(false),
    listRoles.validator,
    listRoles.service,
    listRoles.errorHandler
  );

  // * create role /web/auth/roles
  router.post(
    createRole.path,
    authMiddleware.checkToken(createRole.checkToken),
    newRoleMiddleware.checkRoles(createRole.roles, createRole.permissions, createRole.checkToken),
    userActionLogMiddleware(false),
    createRole.validator,
    createRole.service,
    createRole.errorHandler
  );

  // * update role /web/auth/roles/:id
  router.put(
    updateRoleById.path,
    authMiddleware.checkToken(updateRoleById.checkToken),
    newRoleMiddleware.checkRoles(updateRoleById.roles, updateRoleById.permissions, updateRoleById.checkToken),
    userActionLogMiddleware(false),
    updateRoleById.validator,
    updateRoleById.service,
    updateRoleById.errorHandler
  );

  // * read role by id /web/auth/role/:id
  router.get(
    readRoleById.path,
    authMiddleware.checkToken(readRoleById.checkToken),
    newRoleMiddleware.checkRoles(readRoleById.roles, readRoleById.permissions, readRoleById.checkToken),
    userActionLogMiddleware(false),
    readRoleById.validator,
    readRoleById.service,
    readRoleById.errorHandler
  );

  router.delete(
    deleteRoles.path,
    authMiddleware.checkToken(deleteRoles.checkToken),
    newRoleMiddleware.checkRoles(deleteRoles.roles, deleteRoles.permissions, deleteRoles.checkToken),
    userActionLogMiddleware(false),
    deleteRoles.validator,
    deleteRoles.service,
    deleteRoles.errorHandler
  );

  return router;
};
