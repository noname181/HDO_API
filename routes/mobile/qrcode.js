const router = require("express").Router();
const { decodeQRcode } = require("../../api/qrCode");

const { configuration } = require("../../config/config");
const { TokenService } = require("../../util/tokenService");
const { AuthMiddleware } = require("../../middleware/auth.middleware");
const { RoleMiddleware } = require("../../middleware/role.middleware");

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

/**
 *  @openapi
 *  /qrCode:
 *    get:
 *      tags:
 *        - QRCODE
 *      summary: decode qr code
 *      parameters:
 *        - name: url
 *          in: query
 *          description: 'url qrcode. '
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
 */
router.get(
  "/qrCode",
  authMiddleware.checkToken(decodeQRcode.checkToken),
  roleMiddleware.checkRoles(decodeQRcode.roles),
  decodeQRcode.validator,
  decodeQRcode.service,
  decodeQRcode.errorHandler
);

module.exports = router;
