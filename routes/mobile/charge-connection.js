const router = require('express').Router();
const {
  refreshChargeConnection,
  listChargConnection,
  bookChargeConnections,
  createPaymentLog,
} = require('../../api/charge-connection');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const {
  updateChargeConnectionByChargeId,
} = require('../../controllers/mobileControllers/charge/updateChargeConnectionByChargeId');

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

/**
 *  @openapi
 *  /charge-connections:
 *    get:
 *      tags:
 *        - Charge Connection
 *      summary: Charge Connection List
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
 *                      $ref: '#/components/schemas/ChargeConnection'
 */
router.get(
  listChargConnection.path,
  authMiddleware.checkToken(listChargConnection.checkToken),
  roleMiddleware.checkRoles(listChargConnection.roles),
  listChargConnection.validator,
  listChargConnection.service,
  listChargConnection.errorHandler
);

/**
 *  @openapi
 *  /charge-connections/refresh:
 *    get:
 *      tags:
 *        - Charge Connection
 *      summary: Refresh Charge Connection
 *      parameters:
 *        - name: chg_id
 *          in: path
 *          description: chg_id
 *          required: true
 *          example: 10
 *          schema:
 *          type: string
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/RefreshChargeConnection'
 */
router.get(
  refreshChargeConnection.path,
  authMiddleware.checkToken(refreshChargeConnection.checkToken),
  roleMiddleware.checkRoles(refreshChargeConnection.roles),
  refreshChargeConnection.validator,
  refreshChargeConnection.service,
  refreshChargeConnection.errorHandler
);

/**
 *  @openapi
 *  /charge-connections/charge:
 *    put:
 *      tags:
 *        - Charge Connection
 *      summary: Update Charge Connection
 *      parameters:
 *        - name: chg_id
 *          in: path
 *          description: chg_id
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *        - name: key
 *          in: path
 *          description: key
 *          required: true
 *          example: 10
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
 *                      $ref: '#/components/schemas/ChargeConnectionInfo'
 */
router.put(
  updateChargeConnectionByChargeId.path,
  authMiddleware.checkToken(updateChargeConnectionByChargeId.checkToken),
  roleMiddleware.checkRoles(updateChargeConnectionByChargeId.roles),
  updateChargeConnectionByChargeId.validator(config.occpKey),
  updateChargeConnectionByChargeId.service,
  updateChargeConnectionByChargeId.errorHandler
);

router.post(
  bookChargeConnections.path,
  authMiddleware.checkToken(bookChargeConnections.checkToken),
  roleMiddleware.checkRoles(bookChargeConnections.roles),
  bookChargeConnections.validator,
  bookChargeConnections.service,
  bookChargeConnections.errorHandler
);

router.post(
  createPaymentLog.path,
  authMiddleware.checkToken(createPaymentLog.checkToken),
  roleMiddleware.checkRoles(createPaymentLog.roles),
  createPaymentLog.validator,
  createPaymentLog.service,
  createPaymentLog.errorHandler
);

module.exports = router;
