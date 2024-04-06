const router = require('express').Router();
const { listAction, listActionNew, readAction, searchStation, listStationPaid } = require('../../api/sb-charging-station-manage');
const { chargingStationPrice, readChargingStationByOrg } = require('../../api/charging-station');
const { readChargingStationById } = require('../../controllers/mobileControllers/charging/readChargingStationById');

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { getChargerInfoByChargerId } = require('../../controllers/mobileControllers/charging/getChargerInfoByChargerId'); 
// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

/**
 *  @openapi
 *  /charging-stations-on-map:
 *    get:
 *      tags:
 *        - Mobile Charge Station
 *      summary: Query Charge station
 *      parameters:
 *        - name: name
 *          in: path
 *          description: 'Search with name. '
 *          schema:
 *            type: string
 *        - name: zoomLv
 *          in: path
 *          description: 'Search with zoomLv. '
 *          required: true
 *          schema:
 *            type: number
 *        - name: speed
 *          in: path
 *          description: 'Search with speed. '
 *          schema:
 *            type: number
 *        - name: lat
 *          in: path
 *          description: 'Search with latitude. '
 *          required: true
 *          schema:
 *            type: number
 *        - name: lng
 *          in: path
 *          description: 'Search with longitude. '
 *          required: true
 *          schema:
 *            type: number
 *        - name: status
 *          in: path
 *          description: 'Search with charging station status. '
 *          schema:
 *            type: string
 *        - name: chargerStatus
 *          in: path
 *          description: 'Search with charger status. '
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
 *                    type: array
 *                    items:
 */
router.get(
  '/charging-stations-on-map',
  authMiddleware.checkToken(listAction.checkToken),
  roleMiddleware.checkRoles(listAction.roles),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);


/**
 *  @openapi
 *  /charging-stations-on-map-new:
 *    get:
 *      tags:
 *        - Mobile Charge Station
 *      summary: Query Charge station
 *      parameters:
 *        - name: name
 *          in: path
 *          description: 'Search with name. '
 *          schema:
 *            type: string
 *        - name: zoomLv
 *          in: path
 *          description: 'Search with zoomLv. '
 *          required: true
 *          schema:
 *            type: number
 *        - name: speed
 *          in: path
 *          description: 'Search with speed. '
 *          schema:
 *            type: number
 *        - name: lat
 *          in: path
 *          description: 'Search with latitude. '
 *          required: true
 *          schema:
 *            type: number
 *        - name: lng
 *          in: path
 *          description: 'Search with longitude. '
 *          required: true
 *          schema:
 *            type: number
 *        - name: status
 *          in: path
 *          description: 'Search with charging station status. '
 *          schema:
 *            type: string
 *        - name: chargerStatus
 *          in: path
 *          description: 'Search with charger status. '
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
 *                    type: array
 *                    items:
 */
router.get(
  '/charging-stations-on-map-new',
  authMiddleware.checkToken(listActionNew.checkToken),
  roleMiddleware.checkRoles(listActionNew.roles),
  listActionNew.validator,
  listActionNew.service,
  listActionNew.errorHandler
);


router.get(
  '/search-charging-stations',
  authMiddleware.checkToken(searchStation.checkToken),
  roleMiddleware.checkRoles(searchStation.roles),
  searchStation.validator,
  searchStation.service,
  searchStation.errorHandler
);


router.get(
  '/charging-stations-paid',
  authMiddleware.checkToken(listStationPaid.checkToken),
  roleMiddleware.checkRoles(listStationPaid.roles),
  listStationPaid.validator,
  listStationPaid.service,
  listStationPaid.errorHandler
);

/**
 *  @openapi
 *  /charging-stations-manage/{chargeId}:
 *    get:
 *      tags:
 *        - Mobile Charge Station
 *      summary: Get charge staion by id
 *      parameters:
 *        - name: chargeId
 *          in: path
 *          description: chargeId
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
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 */
router.get(
  '/charging-stations-manage/:chgs_id',
  authMiddleware.checkToken(readAction.checkToken),
  roleMiddleware.checkRoles(readAction.roles),
  readAction.validator,
  readAction.service,
  readAction.errorHandler
);

router.get(
  chargingStationPrice.path,
  authMiddleware.checkToken(chargingStationPrice.checkToken),
  roleMiddleware.checkRoles(chargingStationPrice.roles),
  chargingStationPrice.validator,
  chargingStationPrice.service,
  chargingStationPrice.errorHandler
);

router.get(
  readChargingStationById.path,
  authMiddleware.checkToken(readChargingStationById.checkToken),
  roleMiddleware.checkRoles(readChargingStationById.roles),
  readChargingStationById.validator,
  readChargingStationById.service,
  readChargingStationById.errorHandler
);

router.get(
  getChargerInfoByChargerId.path,
  authMiddleware.checkToken(getChargerInfoByChargerId.checkToken),
  roleMiddleware.checkRoles(getChargerInfoByChargerId.roles),
  getChargerInfoByChargerId.validator,
  getChargerInfoByChargerId.service,
  getChargerInfoByChargerId.errorHandler
);

router.get(
  readChargingStationByOrg.path,
  authMiddleware.checkToken(readChargingStationByOrg.checkToken),
  roleMiddleware.checkRoles(readChargingStationByOrg.roles),
  readChargingStationByOrg.validator,
  readChargingStationByOrg.service,
  readChargingStationByOrg.errorHandler
);

module.exports = router;
