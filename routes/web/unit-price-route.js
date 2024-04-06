const router = require('express').Router();
const {
  createUnitPriceSet,
  readUnitPriceSetById,
  readUnitPriceSetByChgId,
  updateUnitPriceSet,
  deleteUnitPriceSet,
  listUnitPriceSet,
  deleteBatchUnitPriceSet,
} = require('../../api/unit-price-set');

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
 *  /unit-price-set:
 *    get:
 *      tags:
 *        - UnitPriceSet
 *      summary: Unit Price Set List
 *      parameters:
 *        - name: isUsed
 *          in: query
 *          description: 'query with status in use or not used'
 *          schema:
 *            type: string
 *        - name: unitPriceSetName
 *          in: query
 *          description: 'search unit price name'
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
 *                      $ref: '#/components/schemas/UnitPriceSet'
 */
router.get(
  listUnitPriceSet.path,
  authMiddleware.checkToken(listUnitPriceSet.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listUnitPriceSet.roles, listUnitPriceSet.permissions, listUnitPriceSet.checkToken),
  listUnitPriceSet.validator,
  listUnitPriceSet.service,
  listUnitPriceSet.errorHandler
);

/**
 *  @openapi
 *  /unit-price-set/{unitPriceId}:
 *    get:
 *      tags:
 *        - UnitPriceSet
 *      summary: Find UnitPriceSet by ID
 *      parameters:
 *        - name: unitPriceId
 *          in: path
 *          description: unitPriceId
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
 *                    $ref: '#/components/schemas/UnitPriceSet'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UnitPriceSetError404'
 */
router.get(
  readUnitPriceSetById.path,
  authMiddleware.checkToken(readUnitPriceSetById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readUnitPriceSetById.roles,
    readUnitPriceSetById.permissions,
    readUnitPriceSetById.checkToken
  ),
  readUnitPriceSetById.validator,
  readUnitPriceSetById.service,
  readUnitPriceSetById.errorHandler
);

/**
 *  @openapi
 *  /charger-price/:chg_id:
 *    get:
 *      tags:
 *        - UnitPriceSet
 *      summary: Find UnitPriceSet by Charger ID
 *      parameters:
 *        - name: chg_id
 *          in: path
 *          description: charger id
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
 *                    $ref: '#/components/schemas/UnitPriceSet'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UnitPriceSetError404'
 */
router.get(
  readUnitPriceSetByChgId.path,
  authMiddleware.checkToken(readUnitPriceSetByChgId.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readUnitPriceSetByChgId.roles,
    readUnitPriceSetByChgId.permissions,
    readUnitPriceSetByChgId.checkToken
  ),
  readUnitPriceSetByChgId.validator,
  readUnitPriceSetByChgId.service,
  readUnitPriceSetByChgId.errorHandler
);

/**
 *  @openapi
 *  /unit-price-set:
 *    post:
 *      tags:
 *        - UnitPriceSet
 *      summary: Create new UnitPriceSet
 *      requestBody:
 *        description: Create a new UnitPriceSet
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UnitPriceSetInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/UnitPriceSetInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/UnitPriceSetInfo'
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
 *                    $ref: '#/components/schemas/UnitPriceSet'
 */
router.post(
  createUnitPriceSet.path,
  authMiddleware.checkToken(createUnitPriceSet.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createUnitPriceSet.roles, createUnitPriceSet.permissions, createUnitPriceSet.checkToken),
  createUnitPriceSet.validator,
  createUnitPriceSet.service,
  createUnitPriceSet.errorHandler
);

/**
 *  @openapi
 *  /unit-price-set/{unitPriceId}:
 *    put:
 *      tags:
 *        - UnitPriceSet
 *      summary: Update UnitPriceSet
 *      parameters:
 *        - name: unitPriceId
 *          in: path
 *          description: unitPriceId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Update UnitPriceSet in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UnitPriceSetInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/UnitPriceSetInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/UnitPriceSetInfo'
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
 *                    $ref: '#/components/schemas/UnitPriceSet'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UnitPriceSetError404'
 */
router.put(
  updateUnitPriceSet.path,
  authMiddleware.checkToken(updateUnitPriceSet.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateUnitPriceSet.roles, updateUnitPriceSet.permissions, updateUnitPriceSet.checkToken),
  updateUnitPriceSet.validator,
  updateUnitPriceSet.service,
  updateUnitPriceSet.errorHandler
);

router.delete(
  deleteBatchUnitPriceSet.path,
  authMiddleware.checkToken(deleteBatchUnitPriceSet.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    deleteBatchUnitPriceSet.roles,
    deleteBatchUnitPriceSet.permissions,
    deleteBatchUnitPriceSet.checkToken
  ),
  deleteBatchUnitPriceSet.validator,
  deleteBatchUnitPriceSet.service,
  deleteBatchUnitPriceSet.errorHandler
);

/**
 *  @openapi
 *  /unit-price-set/{unitPriceId}:
 *    delete:
 *      tags:
 *        - UnitPriceSet
 *      summary: Delete unit price set
 *      parameters:
 *        - name: unitPriceId
 *          in: query
 *          description: unitPriceId
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  deleteUnitPriceSet.path,
  authMiddleware.checkToken(deleteUnitPriceSet.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteUnitPriceSet.roles, deleteUnitPriceSet.permissions, deleteUnitPriceSet.checkToken),
  deleteUnitPriceSet.validator,
  deleteUnitPriceSet.service,
  deleteUnitPriceSet.errorHandler
);

module.exports = router;
