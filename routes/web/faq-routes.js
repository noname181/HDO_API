const router = require('express').Router();
const {
  listAction,
  createAction,
  readAction,
  updateAction,
  deleteAction,
  deleteBatchAction,
} = require('../../api/faq');

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
 *  /faq:
 *    get:
 *      tags:
 *        - FAQ
 *      summary: FAQ list
 *      parameters:
 *        - name: title
 *          in: path
 *          description: 'Search with title. '
 *          schema:
 *            type: string
 *        - name: category
 *          in: path
 *          description: 'Search with category. '
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
 *                      $ref: '#/components/schemas/FAQ'
 */
router.get(
  '/faq',
  authMiddleware.checkToken(listAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listAction.roles, listAction.permissions, listAction.checkToken),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);

/**
 *  @openapi
 *  /faq/{faqId}:
 *    get:
 *      tags:
 *        - FAQ
 *      summary: Find FAQ by ID
 *      parameters:
 *        - name: faqId
 *          in: path
 *          description: faqId
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
 *                    $ref: '#/components/schemas/FAQ'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FAQError404'
 */
router.get(
  '/faq/:faqId',
  authMiddleware.checkToken(readAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readAction.roles, readAction.permissions, readAction.checkToken),
  readAction.validator,
  readAction.service,
  readAction.errorHandler
);

/**
 *  @openapi
 *  /faq:
 *    post:
 *      tags:
 *        - FAQ
 *      summary: Create new FAQ
 *      requestBody:
 *        description: Create a new FAQ in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FAQInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/FAQInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/FAQInfo'
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
 *                    $ref: '#/components/schemas/FAQ'
 */
router.post(
  '/faq',
  authMiddleware.checkToken(createAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createAction.roles, createAction.permissions, createAction.checkToken),
  createAction.validator,
  createAction.service,
  createAction.errorHandler
);

/**
 *  @openapi
 *  /faq/{faqId}:
 *    put:
 *      tags:
 *        - FAQ
 *      summary: Update FAQ
 *      parameters:
 *        - name: faqId
 *          in: path
 *          description: faqId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Create a new FAQ in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FAQInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/FAQInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/FAQInfo'
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
 *                    $ref: '#/components/schemas/FAQ'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FAQError404'
 */
router.put(
  '/faq/:faqId',
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
 *  /faq/{faqId}:
 *    delete:
 *      tags:
 *        - FAQ
 *      summary: Delete FAQ
 *      parameters:
 *        - name: faqId
 *          in: query
 *          description: faqId
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  '/faq/:faqId',
  authMiddleware.checkToken(deleteAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteAction.roles, deleteAction.permissions, deleteAction.checkToken),
  deleteAction.validator,
  deleteAction.service,
  deleteAction.errorHandler
);

module.exports = router;
