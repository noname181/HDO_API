import { Router } from 'express';
import { configuration } from '../../config/config';
import { TokenService } from '../../util/tokenService';
import { NewRoleMiddleware } from '../../middleware/newRole.middleware';
import { getLogCloudWatch } from '../../controllers/webAdminControllers/logControllers/getLogCloudWatch';
import { userActionLogMiddleware } from '../../middleware/user-action-logger';
import { exceptionAsyncService } from '../../util/exceptionAsyncService';
const { AuthMiddleware } = require('../../middleware/auth.middleware');

export const logsRoutes = () => {
  const router = Router();
  const config = configuration();
  const tokenService = new TokenService(config);
  const authMiddleware = new AuthMiddleware(config, tokenService);
  const newRoleMiddleware = new NewRoleMiddleware();

  router.get(
    getLogCloudWatch.path,
    authMiddleware.checkToken(getLogCloudWatch.checkToken),
    userActionLogMiddleware(false),
    newRoleMiddleware.checkRoles(getLogCloudWatch.roles, getLogCloudWatch.permissions, getLogCloudWatch.checkToken),
    exceptionAsyncService(getLogCloudWatch.service)
  );

  return router;
};
