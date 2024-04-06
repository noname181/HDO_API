const router = require('express').Router();
const {
  createAction,
  readAction,
  updateAction,
  deleteAction,
  listAction,
  exportExcelAcction,
  deleteBatchTrouble,
  readActionOfRequestUser,
  readActionDetailOfRequestUser,
} = require('../../api/trouble');

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
 *  /trouble:
 *    get:
 *      tags:
 *        - Trouble Report
 *      summary: Trouble List
 *      parameters:
 *        - name: status
 *          in: query
 *          description: 'query with status. '
 *          schema:
 *            type: string
 *        - name: searchCharName
 *          in: query
 *          description: 'search CharName'
 *          schema:
 *            type: string
 *        - name: title
 *          in: query
 *          description: 'search title'
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
 *                      $ref: '#/components/schemas/Trouble'
 */
router.get(
  '/trouble',
  authMiddleware.checkToken(listAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listAction.roles, listAction.permissions, listAction.checkToken),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);

router.get(
  '/trouble/user',
  authMiddleware.checkToken(readActionOfRequestUser.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readActionOfRequestUser.roles,
    readActionOfRequestUser.permissions,
    readActionOfRequestUser.checkToken
  ),
  readActionOfRequestUser.validator,
  readActionOfRequestUser.service,
  readActionOfRequestUser.errorHandler
);

/**
 *  @openapi
 *  /trouble/{troubleId}:
 *    get:
 *      tags:
 *        - Trouble Report
 *      summary: Find trouble by ID
 *      parameters:
 *        - name: troubleId
 *          in: path
 *          description: troubleId
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
 *                    $ref: '#/components/schemas/Trouble'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/TroubleError404'
 */
router.get(
  '/trouble/:troubleId',
  authMiddleware.checkToken(readAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readAction.roles, readAction.permissions, readAction.checkToken),
  readAction.validator,
  readAction.service,
  readAction.errorHandler
);

router.get(
  '/trouble/user/:troubleId',
  authMiddleware.checkToken(readActionDetailOfRequestUser.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readActionDetailOfRequestUser.roles,
    readActionDetailOfRequestUser.permissions,
    readActionDetailOfRequestUser.checkToken
  ),
  readActionDetailOfRequestUser.validator,
  readActionDetailOfRequestUser.service,
  readActionDetailOfRequestUser.errorHandler
);

/**
 *  @openapi
 *  /trouble:
 *    post:
 *      tags:
 *        - Trouble Report
 *      summary: Create new Btrouble
 *      requestBody:
 *        description: Create a new trouble
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TroubleInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/TroubleInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/TroubleInfo'
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
 *                    $ref: '#/components/schemas/Trouble'
 */
router.post(
  '/trouble',
  authMiddleware.checkToken(createAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createAction.roles, createAction.permissions, createAction.checkToken),
  createAction.validator,
  createAction.service,
  createAction.errorHandler
);

/**
 *  @openapi
 *  /trouble/{troubleId}:
 *    put:
 *      tags:
 *        - Trouble Report
 *      summary: Update trouble
 *      parameters:
 *        - name: troubleId
 *          in: path
 *          description: troubleId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: update Trouble
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TroubleInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/TroubleInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/TroubleInfo'
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
 *                    $ref: '#/components/schemas/Trouble'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FAQError404'
 */
router.put(
  '/trouble/:troubleId',
  authMiddleware.checkToken(updateAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateAction.roles, updateAction.permissions, updateAction.checkToken),
  updateAction.validator,
  updateAction.service,
  updateAction.errorHandler
);

router.delete(
  deleteBatchTrouble.path,
  authMiddleware.checkToken(deleteBatchTrouble.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteBatchTrouble.roles, deleteBatchTrouble.permissions, deleteBatchTrouble.checkToken),
  deleteBatchTrouble.validator,
  deleteBatchTrouble.service,
  deleteBatchTrouble.errorHandler
);

/**
 *  @openapi
 *  /trouble/{troubleId}:
 *    delete:
 *      tags:
 *        - Trouble Report
 *      summary: Delete trouble
 *      parameters:
 *        - name: troubleId
 *          in: path
 *          description: troubleId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  '/trouble/:troubleId',
  authMiddleware.checkToken(deleteAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteAction.roles, deleteAction.permissions, deleteAction.checkToken),
  deleteAction.validator,
  deleteAction.service,
  deleteAction.errorHandler
);

/**
 *  @openapi
 *  /trouble/exportExcel:
 *    get:
 *      tags:
 *        - Trouble Report
 *      summary: export Excel trouble
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.get(
  '/trouble/exportExcel',
  authMiddleware.checkToken(exportExcelAcction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(exportExcelAcction.roles, exportExcelAcction.permissions, exportExcelAcction.checkToken),
  exportExcelAcction.validator,
  exportExcelAcction.service,
  exportExcelAcction.errorHandler
);

module.exports = router;
