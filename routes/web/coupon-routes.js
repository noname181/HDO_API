const router = require('express').Router();
const { listAction, createAction, readAction, updateAction, deleteAction } = require('../../api/coupon');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');
// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

/**
 *  @openapi
 *  /coupon:
 *    get:
 *      tags:
 *        - Coupon
 *      summary: Coupon list
 *      parameters:
 *        - name: number
 *          in: path
 *          description: 'Search with number. '
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
 *                      $ref: '#/components/schemas/Coupon'
 */
router.get(
  '/coupon',
  authMiddleware.checkToken(listAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listAction.roles, listAction.permissions, listAction.checkToken),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);

/**
 *  @openapi
 *  /coupon/{couponId}:
 *    get:
 *      tags:
 *        - Coupon
 *      summary: Find coupon by ID
 *      parameters:
 *        - name: couponId
 *          in: path
 *          description: couponId
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
 *                  result:
 *                    $ref: '#/components/schemas/Coupon'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CouponError404'
 */
router.get(
  '/coupon/:couponId',
  authMiddleware.checkToken(readAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readAction.roles, readAction.permissions, readAction.checkToken),
  readAction.validator,
  readAction.service,
  readAction.errorHandler
);

/**
 *  @openapi
 *  /coupon:
 *    post:
 *      tags:
 *        - Coupon
 *      summary: Create new coupon
 *      requestBody:
 *        description: Create a new Coupon in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CouponInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/CouponInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/CouponInfo'
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
 *                    $ref: '#/components/schemas/Coupon'
 */
router.post(
  '/coupon',
  authMiddleware.checkToken(createAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createAction.roles, createAction.permissions, createAction.checkToken),
  createAction.validator,
  createAction.service,
  createAction.errorHandler
);

/**
 *  @openapi
 *  /coupon/{couponId}:
 *    put:
 *      tags:
 *        - Coupon
 *      summary: Update coupon
 *      parameters:
 *        - name: couponId
 *          in: path
 *          description: couponId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Create a new Coupon in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CouponInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/CouponInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/CouponInfo'
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
 *                    $ref: '#/components/schemas/Coupon'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CouponError404'
 */
router.put(
  '/coupon/:couponId',
  authMiddleware.checkToken(updateAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateAction.roles, updateAction.permissions, updateAction.checkToken),
  updateAction.validator,
  updateAction.service,
  updateAction.errorHandler
);

/**
 *  @openapi
 *  /coupon/{couponId}:
 *    delete:
 *      tags:
 *        - Coupon
 *      summary: Delete coupon
 *      parameters:
 *        - name: couponId
 *          in: query
 *          description: couponId
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  '/coupon/:couponId',
  authMiddleware.checkToken(deleteAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteAction.roles, deleteAction.permissions, deleteAction.checkToken),
  deleteAction.validator,
  deleteAction.service,
  deleteAction.errorHandler
);

module.exports = router;
