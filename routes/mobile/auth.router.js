const router = require('express').Router();

const checkAccountId = require('../../controllers/mobileControllers/auth/checkAccountId/checkAccountId');
const { register } = require('../../controllers/mobileControllers/auth/register/register');
const { loginByAccountId } = require('../../controllers/mobileControllers/auth/loginByAccountId/loginByAccountId');
const logout = require('../../controllers/mobileControllers/auth/logout/logout');
const { refreshToken } = require('../../controllers/mobileControllers/auth/refreshToken/refreshToken');
const snsCheck = require('../../controllers/mobileControllers/auth/sns/check-social-login');
const snsSave = require('../../controllers/mobileControllers/auth/sns/save-social-login');
const { socialLogin } = require('../../controllers/mobileControllers/auth/sns/social-login');
const snsCancel = require('../../controllers/mobileControllers/auth/sns/cancel-social-connect');
const { resetPassword } = require('../../controllers/mobileControllers/auth/resetPassword/resetPassword');
const { createToken } = require('../../controllers/mobileControllers/auth/biometrics/createToken/createToken');
const {
  verifyBiometrics,
} = require('../../controllers/mobileControllers/auth/biometrics/verifyBiometrics/verifyBiometrics');
const { exceptionAsyncService } = require('../../util/exceptionAsyncService');

const { configuration } = require('../../config/config');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { TokenService } = require('../../util/tokenService');
const { RoleMiddleware } = require('../../middleware/role.middleware');

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

/**
 *  @openapi
 *  /mobile/auth/register:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: mobile user register
 *      requestBody:
 *        description: user sign in
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accountId:
 *                  type: string
 *                  default: test123
 *                password:
 *                  type: string
 *                  default: test@123
 *                email:
 *                  type: string
 *                  default: test@test.com
 *                phoneNumber:
 *                  type: string
 *                  default: 034324389
 *        required: true
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/UserResponseWithAuth'
 */
router.post(register.path, register.validator, register.service, register.errorHandler);

/**
 *  @openapi
 *  /mobile/auth/account/check:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: mobile check accountId
 *      requestBody:
 *        description: user sign in
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accountId:
 *                  type: string
 *                  default: test123
 *        required: true
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/UserResponseWithAuth'
 */
router.post(checkAccountId.path, checkAccountId.validator, checkAccountId.service, checkAccountId.errorHandler);

/**
 *  @openapi
 *  /mobile/auth/login:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: mobile user login by accountId
 *      requestBody:
 *        description: mobile user login by accountId
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accountId:
 *                  type: string
 *                  default: test123
 *                password:
 *                  type: string
 *                  default: test@123
 *        required: true
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/UserResponseWithAuth'
 */
router.post(loginByAccountId.path, loginByAccountId.validator, loginByAccountId.service, loginByAccountId.errorHandler);

/**
 *  @openapi
 *  /mobile/auth/logout:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: user logout
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/UserResponseWithAuth'
 */
router.post(
  logout.path,
  authMiddleware.checkToken(logout.checkToken),
  roleMiddleware.checkRoles(),
  logout.validator,
  logout.service,
  logout.errorHandler
);

/**
 *  @openapi
 *  /mobile/auth/token/refresh:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: user refresh token
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/UserResponseWithAuth'
 */
router.post(
  refreshToken.path,
  authMiddleware.checkRefreshToken(),
  refreshToken.validator,
  refreshToken.service,
  refreshToken.errorHandler
);

router.post(
  resetPassword.path,
  authMiddleware.checkToken(resetPassword.checkToken),
  roleMiddleware.checkRoles(resetPassword.roles),
  resetPassword.validator,
  resetPassword.service,
  resetPassword.errorHandler
);

/**
 *  @openapi
 *  /mobile/auth/sns/save:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: social login info save
 *      requestBody:
 *        description: social login info save
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  default: NicYG4joYjN6A-9U8V95xq5l-hVFNhvSPnx11iYECinI2gAAAYpOogwI
 *                provider:
 *                  type: string
 *                  default: 'KAKAO / NAVER / GOOGLE / APPLE / BIO'
 *        required: true
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                   $ref: '#/components/schemas/SaveResponse'
 *
 */
router.post(
  snsSave.path,
  authMiddleware.checkToken(snsSave.checkToken),
  roleMiddleware.checkRoles(snsSave.roles),
  snsSave.validator,
  exceptionAsyncService(snsSave.service),
  snsSave.errorHandler
);

/**
 *  @openapi
 *  /mobile/auth/sns/check:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: check social login info and save
 *      requestBody:
 *        description: check social login info and save
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  default: NicYG4joYjN6A-9U8V95xq5l-hVFNhvSPnx11iYECinI2gAAAYpOogwI
 *                provider:
 *                  type: string
 *                  default: 'KAKAO / NAVER / GOOGLE / APPLE / BIO'
 *        required: true
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                   $ref: '#/components/schemas/SaveResponse'
 *
 */
router.post(
  snsCheck.path,
  authMiddleware.checkToken(snsCheck.checkToken),
  roleMiddleware.checkRoles(snsCheck.roles),
  snsCheck.validator,
  exceptionAsyncService(snsCheck.service),
  snsCheck.errorHandler
);

/**
 *  @openapi
 *  /mobile/auth/sns/login:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: social login info save
 *      requestBody:
 *        description: social login info save
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  default: NicYG4joYjN6A-9U8V95xq5l-hVFNhvSPnx11iYECinI2gAAAYpOogwI
 *                provider:
 *                  type: string
 *                  default: 'KAKAO / NAVER / GOOGLE / APPLE / BIO'
 *        required: true
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                   $ref: '#/components/schemas/UserResponseWithAuth'
 *
 */
router.post(
  socialLogin.path,
  socialLogin.validator,
  exceptionAsyncService(socialLogin.service),
  socialLogin.errorHandler
);

/**
 *  @openapi
 *  /mobile/auth/sns/cancel:
 *    post:
 *      tags:
 *        - MOBILE USERS
 *      summary: social login cancel
 *      requestBody:
 *        description: social login cancel
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                provider:
 *                  type: string
 *                  default: 'KAKAO / NAVER / GOOGLE / APPLE / BIO'
 *        required: true
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                   $ref: '#/components/schemas/SaveResponse'
 *
 */
router.post(
  snsCancel.path,
  authMiddleware.checkToken(snsCancel.checkToken),
  roleMiddleware.checkRoles(snsCancel.roles),
  snsCancel.validator,
  snsCancel.service,
  snsCancel.errorHandler
);

router.post(createToken.path, createToken.validator, createToken.service, createToken.errorHandler);

router.post(
  verifyBiometrics.path,
  authMiddleware.checkToken(verifyBiometrics.checkToken),
  roleMiddleware.checkRoles(verifyBiometrics.roles),
  verifyBiometrics.validator,
  verifyBiometrics.service,
  verifyBiometrics.errorHandler
);

module.exports = router;
