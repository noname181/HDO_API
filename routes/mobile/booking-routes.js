const router = require("express").Router();
const {
  createBooking,
  readBookingById,
  updateBooking,
  deleteBooking,
  listBooking,
  listChargingStations,
} = require("../../api/booking");
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
 *  /booking:
 *    get:
 *      tags:
 *        - Booking
 *      summary: Booking list
 *      parameters:
 *        - name: status
 *          in: query
 *          description: 'Search with status.'
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
 *                      $ref: '#/components/schemas/Booking'
 */
router.get(
  "/booking",
  authMiddleware.checkToken(listBooking.checkToken),
  roleMiddleware.checkRoles(listBooking.roles),
  listBooking.validator,
  listBooking.service,
  listBooking.errorHandler
);

/**
 *  @openapi
 *  /booking:
 *    post:
 *      tags:
 *        - Booking
 *      summary: Create new Booking
 *      requestBody:
 *        description: Create a new Booking
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BookingInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/BookingInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/BookingInfo'
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
 *                    $ref: '#/components/schemas/Booking'
 */
router.post(
  "/booking",
  authMiddleware.checkToken(createBooking.checkToken),
  roleMiddleware.checkRoles(createBooking.roles),
  createBooking.validator,
  createBooking.service,
  createBooking.errorHandler
);

/**
 *  @openapi
 *  /booking-charging-stations:
 *    get:
 *      tags:
 *        - Booking
 *      summary: Charging Station List
 *      parameters:
 *        - name: b_time_in
 *          in: query
 *          description: 'Time in.'
 *          schema:
 *            type: string
 *        - name: b_time_out
 *          in: query
 *          description: 'Time out.'
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
 *                      $ref: '#/components/schemas/ChargingStation'
 */
router.get(
  "/booking-charger-station",
  authMiddleware.checkToken(listChargingStations.checkToken),
  roleMiddleware.checkRoles(listChargingStations.roles),
  listChargingStations.validator,
  listChargingStations.service,
  listChargingStations.errorHandler
);

/**
 *  @openapi
 *  /booking/{bookingId}:
 *    get:
 *      tags:
 *        - Booking
 *      summary: Find Booking by ID
 *      parameters:
 *        - name: bookingId
 *          in: path
 *          description: bookingId
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
 *                    $ref: '#/components/schemas/Booking'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/BookingError404'
 */
router.get(
  "/booking/:bookingId",
  authMiddleware.checkToken(readBookingById.checkToken),
  roleMiddleware.checkRoles(readBookingById.roles),
  readBookingById.validator,
  readBookingById.service,
  readBookingById.errorHandler
);

/**
 *  @openapi
 *  /booking/{bookingId}:
 *    put:
 *      tags:
 *        - Booking
 *      summary: Update Booking
 *      parameters:
 *        - name: bookingId
 *          in: path
 *          description: bookingId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Update Booking in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BookingInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/BookingInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/BookingInfo'
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
 *                    $ref: '#/components/schemas/Booking'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/BookingError404'
 */
router.put(
  "/booking/:bookingId",
  authMiddleware.checkToken(updateBooking.checkToken),
  roleMiddleware.checkRoles(updateBooking.roles),
  updateBooking.validator,
  updateBooking.service,
  updateBooking.errorHandler
);

/**
 *  @openapi
 *  /booking/{booking}:
 *    delete:
 *      tags:
 *        - Booking
 *      summary: Delete booking
 *      parameters:
 *        - name: bookingId
 *          in: query
 *          description: bookingId
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  "/booking/:bookingId",
  authMiddleware.checkToken(deleteBooking.checkToken),
  roleMiddleware.checkRoles(deleteBooking.roles),
  deleteBooking.validator,
  deleteBooking.service,
  deleteBooking.errorHandler
);

module.exports = router;
