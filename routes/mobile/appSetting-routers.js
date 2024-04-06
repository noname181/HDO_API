const router = require('express').Router();
const { updateAppSetting, listAppSetting, detailAppSetting } = require('../../api/AppSetting');
const { readAppVersion } = require('../../api/config');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

router.get(
  '/appSetting',
  authMiddleware.checkToken(listAppSetting.checkToken),
  roleMiddleware.checkRoles(listAppSetting.roles),
  listAppSetting.validator,
  listAppSetting.service,
  listAppSetting.errorHandler
);

router.put(
  '/appSetting/:appId',
  authMiddleware.checkToken(updateAppSetting.checkToken),
  roleMiddleware.checkRoles(updateAppSetting.roles),
  updateAppSetting.validator,
  updateAppSetting.service,
  updateAppSetting.errorHandler
);

router.get(
  '/appSetting/:appId',
  authMiddleware.checkToken(detailAppSetting.checkToken),
  roleMiddleware.checkRoles(detailAppSetting.roles),
  detailAppSetting.validator,
  detailAppSetting.service,
  detailAppSetting.errorHandler
);

router.get(
  readAppVersion.path,
  authMiddleware.checkToken(readAppVersion.checkToken),
  roleMiddleware.checkRoles(readAppVersion.roles),
  readAppVersion.validator,
  readAppVersion.service,
  readAppVersion.errorHandler
);

module.exports = router;
