const router = require('express').Router();
const {
  createCarWash,
  readCarWashById,
  updateCarWash,
  deleteCarWash,
  listCarWash,
  deleteBatchCarWash,
} = require('../../api/car-wash');

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
 *  /car-wash:
 *    get:
 *      tags:
 *        - CarWash
 *      summary: CarWash list
 *      parameters:
 *        - name: carNumber
 *          in: query
 *          description: 'Search with car number.'
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
 *                      $ref: '#/components/schemas/CarWash'
 */
router.get(
  '/car-wash',
  authMiddleware.checkToken(listCarWash.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listCarWash.roles, listCarWash.permissions, listCarWash.checkToken),
  listCarWash.validator,
  listCarWash.service,
  listCarWash.errorHandler
);

/**
 *  @openapi
 *  /car-wash/{carWashId}:
 *    get:
 *      tags:
 *        - CarWash
 *      summary: Find CarWash by ID
 *      parameters:
 *        - name: carWashId
 *          in: path
 *          description: carWashId
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
 *                    $ref: '#/components/schemas/CarWash'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CarWashError404'
 */
router.get(
  '/car-wash/:carWashId',
  authMiddleware.checkToken(readCarWashById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readCarWashById.roles, readCarWashById.permissions, readCarWashById.checkToken),
  readCarWashById.validator,
  readCarWashById.service,
  readCarWashById.errorHandler
);

/**
 *  @openapi
 *  /car-wash:
 *    post:
 *      tags:
 *        - CarWash
 *      summary: Create new CarWash
 *      requestBody:
 *        description: Create a new CarWash
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CarWashInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/CarWashInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/CarWashInfo'
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
 *                    $ref: '#/components/schemas/CarWash'
 */
router.post(
  '/car-wash',
  authMiddleware.checkToken(createCarWash.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createCarWash.roles, createCarWash.permissions, createCarWash.checkToken),
  createCarWash.validator,
  createCarWash.service,
  createCarWash.errorHandler
);

/**
 *  @openapi
 *  /car-wash/{carWashId}:
 *    put:
 *      tags:
 *        - CarWash
 *      summary: Update CarWash
 *      parameters:
 *        - name: carWashId
 *          in: path
 *          description: carWashId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Update CarWash in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CarWashInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/CarWashInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/CarWashInfo'
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
 *                    $ref: '#/components/schemas/CarWash'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CarWashError404'
 */
router.put(
  '/car-wash/:carWashId',
  authMiddleware.checkToken(updateCarWash.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateCarWash.roles, updateCarWash.permissions, updateCarWash.checkToken),
  updateCarWash.validator,
  updateCarWash.service,
  updateCarWash.errorHandler
);

router.delete(
  deleteBatchCarWash.path,
  authMiddleware.checkToken(deleteBatchCarWash.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteBatchCarWash.roles, deleteBatchCarWash.permissions, deleteBatchCarWash.checkToken),
  deleteBatchCarWash.validator,
  deleteBatchCarWash.service,
  deleteBatchCarWash.errorHandler
);

/**
 *  @openapi
 *  /car-wash/{car-wash}:
 *    delete:
 *      tags:
 *        - CarWash
 *      summary: Delete car-wash
 *      parameters:
 *        - name: carWashId
 *          in: query
 *          description: carWashId
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  '/car-wash/:carWashId',
  authMiddleware.checkToken(deleteCarWash.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteCarWash.roles, deleteCarWash.permissions, deleteCarWash.checkToken),
  deleteCarWash.validator,
  deleteCarWash.service,
  deleteCarWash.errorHandler
);

module.exports = router;
