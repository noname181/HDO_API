const router = require("express").Router();
const {
  createCard,
  readCardById,
  updateCard,
  deleteCard,
  listCard,
} = require("../../api/bank-card");
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
 *  /bank-card/user/{userId}:
 *    get:
 *      tags:
 *        - Card
 *      summary: Get list card by userID
 *      parameters:
 *        - name: userId
 *          in: query
 *          description: 'Search with userID.'
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
 *                      $ref: '#/components/schemas/Card'
 */
router.get(
  "/bank-card/user/:userId",
  authMiddleware.checkToken(listCard.checkToken),
  roleMiddleware.checkRoles(listCard.roles),
  listCard.validator,
  listCard.service,
  listCard.errorHandler
);

/**
 *  @openapi
 *  /bank-card:
 *    post:
 *      tags:
 *        - Card
 *      summary: Create new Card
 *      requestBody:
 *        description: Create a new Card
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CardInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/CardInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/CardInfo'
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
 *                    $ref: '#/components/schemas/Card'
 */
router.post(
  "/bank-card",
  authMiddleware.checkToken(createCard.checkToken),
  roleMiddleware.checkRoles(createCard.roles),
  createCard.validator,
  createCard.service,
  createCard.errorHandler
);

/**
 *  @openapi
 *  /bank-card/{cardId}:
 *    get:
 *      tags:
 *        - Card
 *      summary: Find Card by ID
 *      parameters:
 *        - name: cardId
 *          in: path
 *          description: cardId
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
 *                    $ref: '#/components/schemas/Card'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CardError404'
 */
router.get(
  "/bank-card/:cardId",
  authMiddleware.checkToken(readCardById.checkToken),
  roleMiddleware.checkRoles(readCardById.roles),
  readCardById.validator,
  readCardById.service,
  readCardById.errorHandler
);

/**
 *  @openapi
 *  /bank-card/{cardId}:
 *    put:
 *      tags:
 *        - Card
 *      summary: Update Card
 *      parameters:
 *        - name: cardId
 *          in: path
 *          description: cardId
 *          required: true
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: Update Card in the store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CardInfo'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/CardInfo'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/CardInfo'
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
 *                    $ref: '#/components/schemas/Card'
 *        404:
 *          description: Not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CardError404'
 */
router.put(
  "/bank-card/:cardId",
  authMiddleware.checkToken(updateCard.checkToken),
  roleMiddleware.checkRoles(updateCard.roles),
  updateCard.validator,
  updateCard.service,
  updateCard.errorHandler
);

/**
 *  @openapi
 *  /bank-card/{bank-card}:
 *    delete:
 *      tags:
 *        - Card
 *      summary: Delete bank-card
 *      parameters:
 *        - name: cardId
 *          in: query
 *          description: cardId
 *          required: true
 *          example: 10
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response successfully
 */
router.delete(
  "/bank-card/:cardId",
  authMiddleware.checkToken(deleteCard.checkToken),
  roleMiddleware.checkRoles(deleteCard.roles),
  deleteCard.validator,
  deleteCard.service,
  deleteCard.errorHandler
);

module.exports = router;
