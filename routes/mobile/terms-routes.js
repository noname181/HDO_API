const router = require('express').Router();
const {
  readWithUserAction,
  userReadTermsAction,
  readWithUserRequireAction,
  userReadTermsRequireAction,
} = require('../../api/terms');

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
  readWithUserAction.path,
  authMiddleware.checkToken(readWithUserAction.checkToken),
  roleMiddleware.checkRoles(readWithUserAction.roles),
  readWithUserAction.validator,
  readWithUserAction.service,
  readWithUserAction.errorHandler
);

router.get(
  readWithUserRequireAction.path,
  authMiddleware.checkToken(readWithUserRequireAction.checkToken),
  roleMiddleware.checkRoles(readWithUserRequireAction.roles),
  readWithUserRequireAction.validator,
  readWithUserRequireAction.service,
  readWithUserRequireAction.errorHandler
);

router.post(
  userReadTermsAction.path,
  authMiddleware.checkToken(userReadTermsAction.checkToken),
  roleMiddleware.checkRoles(userReadTermsAction.roles),
  userReadTermsAction.validator,
  userReadTermsAction.service,
  userReadTermsAction.errorHandler
);

router.post(
  userReadTermsRequireAction.path,
  authMiddleware.checkToken(userReadTermsRequireAction.checkToken),
  roleMiddleware.checkRoles(userReadTermsRequireAction.roles),
  userReadTermsRequireAction.validator,
  userReadTermsRequireAction.service,
  userReadTermsRequireAction.errorHandler
);

module.exports = router;
