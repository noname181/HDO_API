const router = require('express').Router();
const {
  createBanner,
  readBannerById,
  updateBanner,
  deleteBanner,
  listBanner,
  deleteBatchBanner,
} = require('../../api/banner');

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
 *  /banner:
 *    get:
 *      tags:
 *        - Banner
 *      summary: Banner list
 *      parameters:
 *        - name: title
 *          in: query
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
 *                      $ref: '#/components/schemas/Banner'
 */
router.get(
  '/banner',
  authMiddleware.checkToken(listBanner.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listBanner.roles, listBanner.permissions, listBanner.checkToken),
  listBanner.validator,
  listBanner.service,
  listBanner.errorHandler
);

/**
 *  @openapi
 *  /banner/{bannerId}:
 *    get:
 *      tags:
 *        - Banner
 *      summary: Find Banner by ID
 *      parameters:
 *        - name: bannerId
 *          in: path
 *          description: bannerId
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
 *                    $ref: '#/components/schemas/Banner'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/BannerError404'
 */
router.get(
  '/banner/:bannerId',
  authMiddleware.checkToken(readBannerById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readBannerById.roles, readBannerById.permissions, readBannerById.checkToken),
  readBannerById.validator,
  readBannerById.service,
  readBannerById.errorHandler
);

/**
 *  @openapi
 *  /banner:
 *    post:
 *      tags:
 *        - Banner
 *      summary: Create new Banner
 *      requestBody:
 *        description: Create a new Banner
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BannerInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/BannerInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/BannerInfo'
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
 *                    $ref: '#/components/schemas/Banner'
 */
router.post(
  '/banner',
  authMiddleware.checkToken(createBanner.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createBanner.roles, createBanner.permissions, createBanner.checkToken),
  createBanner.validator,
  createBanner.service,
  createBanner.errorHandler
);

/**
 *  @openapi
 *  /banner/{bannerId}:
 *    put:
 *      tags:
 *        - Banner
 *      summary: Update banner
 *      parameters:
 *        - name: bannerId
 *          in: path
 *          description: bannerId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: update Banner
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BannerInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/BannerInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/BannerInfo'
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
 *                    $ref: '#/components/schemas/Banner'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/FAQError404'
 */
router.put(
  '/banner/:bannerId',
  authMiddleware.checkToken(updateBanner.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(updateBanner.roles, updateBanner.permissions, updateBanner.checkToken),
  updateBanner.validator,
  updateBanner.service,
  updateBanner.errorHandler
);

router.delete(
  deleteBatchBanner.path,
  authMiddleware.checkToken(deleteBatchBanner.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteBatchBanner.roles, deleteBatchBanner.permissions, deleteBatchBanner.checkToken),
  deleteBatchBanner.validator,
  deleteBatchBanner.service,
  deleteBatchBanner.errorHandler
);

/**
 *  @openapi
 *  /banner/{bannerId}:
 *    delete:
 *      tags:
 *        - Banner
 *      summary: Delete Banner
 *      parameters:
 *        - name: bannerId
 *          in: path
 *          description: bannerId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  '/banner/:bannerId',
  authMiddleware.checkToken(deleteBanner.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteBanner.roles, deleteBanner.permissions, deleteBanner.checkToken),
  deleteBanner.validator,
  deleteBanner.service,
  deleteBanner.errorHandler
);

module.exports = router;
