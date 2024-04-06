const router = require('express').Router();
const {
  listAction,
  createAction,
  readAction,
  updateAction,
  deleteAction,
  deleteBatchAction,
} = require('../../api/terms');

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
 *  /terms:
 *    get:
 *      tags:
 *        - TERMS
 *      summary: TERMS list
 *      parameters:
 *        - name: title
 *          in: path
 *          description: 'Search with title. '
 *          schema:
 *            type: string
 *        - name: category
 *          in: path
 *          description: 'Search with category.(JOIN/PAYMENT) '
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
 *                      $ref: '#/components/schemas/TERMS'
 */
router.get(
  '/terms',
  authMiddleware.checkToken(listAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listAction.roles, listAction.permissions, listAction.checkToken),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);

/**
 *  @openapi
 *  /terms/{termsId}:
 *    get:
 *      tags:
 *        - TERMS
 *      summary: Find TERMS by ID
 *      parameters:
 *        - name: termsId
 *          in: path
 *          description: termsId
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
 *                    $ref: '#/components/schemas/TERMS'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TERMSError404'
 */
router.get(
  '/terms/:termsId',
  authMiddleware.checkToken(readAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readAction.roles, readAction.permissions, readAction.checkToken),
  readAction.validator,
  readAction.service,
  readAction.errorHandler
);

/**
 *  @openapi
 *  /terms:
 *    post:
 *      tags:
 *        - TERMS
 *      summary: Create new TERMS
 *      requestBody:
 *        description: Create a new TERMS in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TERMSInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/TERMSInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/TERMSInfo'
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
 *                    $ref: '#/components/schemas/TERMS'
 */
router.post(
  '/terms',
  authMiddleware.checkToken(createAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createAction.roles, createAction.permissions, createAction.checkToken),
  createAction.validator,
  createAction.service,
  createAction.errorHandler
);

/**
 *  @openapi
 *  /terms/{termsId}:
 *    put:
 *      tags:
 *        - TERMS
 *      summary: Update TERMS
 *      parameters:
 *        - name: termsId
 *          in: path
 *          description: termsId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Create a new TERMS in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TERMSInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/TERMSInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/TERMSInfo'
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
 *                    $ref: '#/components/schemas/TERMS'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TERMSError404'
 */
router.put(
  updateAction.path,
  authMiddleware.checkToken(updateAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateAction.roles, updateAction.permissions, updateAction.checkToken),
  updateAction.validator,
  updateAction.service,
  updateAction.errorHandler
);

router.delete(
  deleteBatchAction.path,
  authMiddleware.checkToken(deleteBatchAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteBatchAction.roles, deleteBatchAction.permissions, deleteBatchAction.checkToken),
  deleteBatchAction.validator,
  deleteBatchAction.service,
  deleteBatchAction.errorHandler
);

/**
 *  @openapi
 *  /terms/{termsId}:
 *    delete:
 *      tags:
 *        - TERMS
 *      summary: Delete TERMS
 *      parameters:
 *        - name: termsId
 *          in: query
 *          description: termsId
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  '/terms/:termsId',
  authMiddleware.checkToken(deleteAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteAction.roles, deleteAction.permissions, deleteAction.checkToken),
  deleteAction.validator,
  deleteAction.service,
  deleteAction.errorHandler
);

module.exports = router;
