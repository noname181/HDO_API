const router = require('express').Router();
const { readBannerById, listBanner, updateViewsBanner } = require('../../api/banner');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

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
  roleMiddleware.checkRoles(listBanner.roles),
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
  roleMiddleware.checkRoles(readBannerById.roles),
  readBannerById.validator,
  readBannerById.service,
  readBannerById.errorHandler
);

router.put(
  updateViewsBanner.path,
  authMiddleware.checkToken(updateViewsBanner.checkToken),
  roleMiddleware.checkRoles(updateViewsBanner.roles),
  updateViewsBanner.validator,
  updateViewsBanner.service,
  updateViewsBanner.errorHandler
);

module.exports = router;
