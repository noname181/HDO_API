const router = require('express').Router();
const {
  listAction,
  createAction,
  readAction,
  updateAction,
  deleteAction,
  deleteBatchAction,
} = require('../../api/notice');

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
 *  /notice:
 *    get:
 *      tags:
 *        - Notice
 *      summary: Notice list
 *      parameters:
 *        - name: title
 *          in: path
 *          description: 'Search with title. '
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
 *                      $ref: '#/components/schemas/Notice'
 */
router.get(
  '/notice',
  authMiddleware.checkToken(listAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listAction.roles, listAction.permissions, listAction.checkToken),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);

/**
 *  @openapi
 *  /notice/{noticeId}:
 *    get:
 *      tags:
 *        - Notice
 *      summary: Find notice by ID
 *      parameters:
 *        - name: noticeId
 *          in: path
 *          description: noticeId
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
 *                    $ref: '#/components/schemas/Notice'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/NoticeError404'
 */
router.get(
  '/notice/:noticeId',
  authMiddleware.checkToken(readAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readAction.roles, readAction.permissions, readAction.checkToken),
  readAction.validator,
  readAction.service,
  readAction.errorHandler
);

/**
 *  @openapi
 *  /notice:
 *    post:
 *      tags:
 *        - Notice
 *      summary: Create new notice
 *      requestBody:
 *        description: Create a new Notice in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/NoticeInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/NoticeInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/NoticeInfo'
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
 *                    $ref: '#/components/schemas/Notice'
 */
router.post(
  '/notice',
  authMiddleware.checkToken(createAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createAction.roles, createAction.permissions, createAction.checkToken),
  createAction.validator,
  createAction.service,
  createAction.errorHandler
);

/**
 *  @openapi
 *  /notice/{noticeId}:
 *    put:
 *      tags:
 *        - Notice
 *      summary: Update notice
 *      parameters:
 *        - name: noticeId
 *          in: path
 *          description: noticeId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Create a new Notice in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/NoticeInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/NoticeInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/NoticeInfo'
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
 *                    $ref: '#/components/schemas/Notice'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/NoticeError404'
 */
router.put(
  '/notice/:noticeId',
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
 *  /notice/{noticeId}:
 *    delete:
 *      tags:
 *        - Notice
 *      summary: Delete notice
 *      parameters:
 *        - name: noticeId
 *          in: query
 *          description: noticeId
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  '/notice/:noticeId',
  authMiddleware.checkToken(deleteAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteAction.roles, deleteAction.permissions, deleteAction.checkToken),
  deleteAction.validator,
  deleteAction.service,
  deleteAction.errorHandler
);

module.exports = router;
