const router = require('express').Router();

const { getMe: getMobileUserMe } = require('../../controllers/mobileControllers/user/getMe/getMe');

const { configuration } = require('../../config/config');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { TokenService } = require('../../util/tokenService');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { updateMyProfile } = require('../../controllers/mobileControllers/user/updateMyProfile/updateMyProfile');
const {
  updateUserInfoWithDupInfo,
} = require('../../controllers/mobileControllers/user/updateMyProfile/updateUserInfoWithDupInfo');
const { sleepMe } = require('../../controllers/mobileControllers/user/sleepMe/sleepMe');
const { exceptionAsyncService } = require('../../util/exceptionAsyncService');

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

/**
 *  @openapi
 *  /mobile/users/me:
 *    get:
 *      tags:
 *        - MOBILE USERS
 *      summary: mobile get me
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/UserResponse'
 */
router.get(
  getMobileUserMe.path,
  authMiddleware.checkToken(getMobileUserMe.checkToken),
  roleMiddleware.checkRoles(getMobileUserMe.roles),
  getMobileUserMe.validator,
  getMobileUserMe.service,
  getMobileUserMe.errorHandler
);

router.put(
  updateMyProfile.path,
  authMiddleware.checkToken(updateMyProfile.checkToken),
  roleMiddleware.checkRoles(updateMyProfile.roles),
  updateMyProfile.validator,
  updateMyProfile.service,
  updateMyProfile.errorHandler
);

router.put(
  updateUserInfoWithDupInfo.path,
  authMiddleware.checkToken(updateUserInfoWithDupInfo.checkToken),
  roleMiddleware.checkRoles(updateUserInfoWithDupInfo.roles),
  updateUserInfoWithDupInfo.validator,
  updateUserInfoWithDupInfo.service,
  updateUserInfoWithDupInfo.errorHandler
);

router.post(
  sleepMe.path,
  authMiddleware.checkToken(sleepMe.checkToken),
  roleMiddleware.checkRoles(sleepMe.roles),
  sleepMe.validator,
  exceptionAsyncService(sleepMe.service),
  sleepMe.errorHandler
);

module.exports = router;
