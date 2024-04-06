const router = require('express').Router();
const readMembership = require('../../api/ocpp/read-membership');
const createAuthPnc = require('../../api/ocpp/create-auth-pnc');
const readAuthPnc = require('../../api/ocpp/read-auth-pnc');
const readUnitPrice = require('../../api/ocpp/readUnitPrice');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

/**
 *  @openapi
 *  /membership:
 *    get:
 *      tags:
 *        - check membership status
 *      summary: check membership status
 *      parameters:
 *        - name: chg_id
 *          in: query
 *          description: '충전기 인덱스.'
 *          schema:
 *            type: string
 *        - name: idtag
 *          in: query
 *          description: '회원 번호 12자리 -포함 string.'
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  totalCount:
 *                    type: integer
 *                    default: 1
 *                  result:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Membership'
 */
router.get(
  '/membership',
  authMiddleware.checkToken(readMembership.checkToken),
  roleMiddleware.checkRoles(readMembership.roles),
  readMembership.validator,
  readMembership.service,
  readMembership.errorHandler
);

router.post(
  createAuthPnc.path,
  authMiddleware.checkToken(createAuthPnc.checkToken),
  roleMiddleware.checkRoles(createAuthPnc.roles),
  createAuthPnc.validator,
  createAuthPnc.service,
  createAuthPnc.errorHandler
);

router.post(
  readAuthPnc.path,
  authMiddleware.checkToken(readAuthPnc.checkToken),
  roleMiddleware.checkRoles(readAuthPnc.roles),
  readAuthPnc.validator,
  readAuthPnc.service,
  readAuthPnc.errorHandler
);

router.post(
  readUnitPrice.path,
  authMiddleware.checkToken(readUnitPrice.checkToken),
  roleMiddleware.checkRoles(readUnitPrice.roles),
  readUnitPrice.validator,
  readUnitPrice.service,
  readUnitPrice.errorHandler
);

module.exports = router;
