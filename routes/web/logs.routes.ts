import { Router } from 'express';
import { configuration } from '../../config/config';
import { TokenService } from '../../util/tokenService';
import { NewRoleMiddleware } from '../../middleware/newRole.middleware';
import { getLogCloudWatch } from '../../controllers/webAdminControllers/logControllers/getLogCloudWatch';
import { userActionLogMiddleware } from '../../middleware/user-action-logger';
import { exceptionAsyncService } from '../../util/exceptionAsyncService';
import { getPaymentLog } from '../../controllers/webAdminControllers/logControllers/paymentLog/getPaymentLogs/getPaymentLog';
import { getPaymentLogById } from '../../controllers/webAdminControllers/logControllers/paymentLog/getPaymentLogById/getPaymentLogById';
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

  router.get(
    getPaymentLog.path,
    authMiddleware.checkToken(getPaymentLog.checkToken),
    userActionLogMiddleware(false),
    newRoleMiddleware.checkRoles(getPaymentLog.roles, getPaymentLog.permissions, getPaymentLog.checkToken),
    exceptionAsyncService(getPaymentLog.service)
  );

  router.get(
    getPaymentLogById.path,
    authMiddleware.checkToken(getPaymentLogById.checkToken),
    userActionLogMiddleware(false),
    newRoleMiddleware.checkRoles(getPaymentLogById.roles, getPaymentLogById.permissions, getPaymentLogById.checkToken),
    exceptionAsyncService(getPaymentLogById.service)
  );

  return router;
};
