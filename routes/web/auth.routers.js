const router = require('express').Router();

const { login: externalLogin } = require('../../controllers/webAdminControllers/auth/external/login/login');
const { login: hdoLogin } = require('../../controllers/webAdminControllers/auth/hdo/login/login');
const {
  requestCreateAccount,
} = require('../../controllers/webAdminControllers/auth/external/requestCreateAccount/requestCreateAccount');
const { createAccount } = require('../../controllers/webAdminControllers/auth/hdo/createAccount/createAccount');

const { configuration } = require('../../config/config');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { TokenService } = require('../../util/tokenService');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const {
  approveCreateAccount,
} = require('../../controllers/webAdminControllers/auth/external/approveCreateAccount/approveCreateAccount');
const {
  requestResetPassword,
} = require('../../controllers/webAdminControllers/auth/external/requestResetPassword/requestResetPassword');
const { changePassword } = require('../../controllers/webAdminControllers/user/change-password/change-password.js');

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

/**
 *  @openapi
 *  /web/auth/external/login:
 *    post:
 *      tags: [Auth]
 *      security:
 *        - basicAuthExternal: []
 *      summary: 외부 로그인
 *      requestBody:
 *        description: 외부 로그인
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accountId:
 *                  type: string
 *                  default: testorg@test.com
 *                password:
 *                  type: string
 *                  default: Test1234!
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
router.post(externalLogin.path, externalLogin.validator, externalLogin.service, externalLogin.errorHandler);

/**
 *  @openapi
 *  /web/auth/hdo/login:
 *    post:
 *      tags: [Auth]
 *      security:
 *        - basicAuthHdo: []
 *      summary: HDO 로그인
 *      requestBody:
 *        description: HDO 로그인
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accountId:
 *                  type: string
 *                  default: testhdo1
 *                password:
 *                  type: string
 *                  default: Test1234!
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
router.post(hdoLogin.path, hdoLogin.validator, hdoLogin.service, hdoLogin.errorHandler);

// * request to create external account
router.post(
  requestCreateAccount.path,
  authMiddleware.checkToken(requestCreateAccount.checkToken),
  newRoleMiddleware.checkRoles(
    requestCreateAccount.roles,
    requestCreateAccount.permissions,
    requestCreateAccount.checkToken
  ),
  requestCreateAccount.validator,
  requestCreateAccount.service,
  requestCreateAccount.errorHandler
);

// * create HDO account
router.post(
  createAccount.path,
  authMiddleware.checkToken(createAccount.checkToken),
  newRoleMiddleware.checkRoles(
    createAccount.roles,
    createAccount.permissions,
    requestCreateAccount.checkToken,
    createAccount.checkToken
  ),
  createAccount.validator,
  createAccount.service,
  createAccount.errorHandler
);

// * approve to create external account
router.post(
  approveCreateAccount.path,
  authMiddleware.checkToken(approveCreateAccount.checkToken),
  newRoleMiddleware.checkRoles(approveCreateAccount.roles, approveCreateAccount.permissions, createAccount.checkToken),
  approveCreateAccount.validator,
  approveCreateAccount.service,
  approveCreateAccount.errorHandler
);

// * Change password
router.post(
  changePassword.path,
  authMiddleware.checkToken(changePassword.checkToken),
  newRoleMiddleware.checkRoles(changePassword.roles, createAccount.checkToken),
  changePassword.validator,
  changePassword.service,
  changePassword.errorHandler
);

// * send email to reset password
router.post(
  requestResetPassword.path,
  requestResetPassword.validator,
  requestResetPassword.service,
  requestResetPassword.errorHandler
);

module.exports = router;
