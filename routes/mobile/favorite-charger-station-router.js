const router = require("express").Router();
const {
  listAction,
  createAction,
} = require("../../api/favorite-charger-station");

const { configuration } = require("../../config/config");
const { TokenService } = require("../../util/tokenService");
const { AuthMiddleware } = require("../../middleware/auth.middleware");
const { RoleMiddleware } = require("../../middleware/role.middleware");

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

/**
 *  @openapi
 *  /favorite-station:
 *    get:
 *      tags:
 *        - Mobile Charge Station
 *      summary: Favorite Charge station
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    type: array
 *                    items:
 */
router.get(
  "/favorite-station",
  authMiddleware.checkToken(listAction.checkToken),
  roleMiddleware.checkRoles(listAction.roles),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);

/**
 *  @openapi
 *  /favorite-station:
 *    post:
 *      tags:
 *        - Mobile Charge Station
 *      summary: Add new or deleted if exist
 *      requestBody:
 *        description: Create a new Notice in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FavoriteChargerStationCluster'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/FavoriteChargerStationCluster'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/FavoriteChargerStationCluster'
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
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 */
router.post(
  createAction.path,
  authMiddleware.checkToken(createAction.checkToken),
  roleMiddleware.checkRoles(createAction.roles),
  createAction.validator,
  createAction.service,
  createAction.errorHandler
);

module.exports = router;
