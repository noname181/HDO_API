const router = require("express").Router();
const {
  createAction,
  readAction,
  updateAction,
  deleteAction,
  listAction,
  exportExcelAcction,
} = require("../../api/trouble");

const { configuration } = require("../../config/config");
const { TokenService } = require("../../util/tokenService");
const { AuthMiddleware } = require("../../middleware/auth.middleware");
const { RoleMiddleware } = require("../../middleware/role.middleware");

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();

// /**
//  *  @openapi
//  *  /trouble:
//  *    get:
//  *      tags:
//  *        - Trouble Report
//  *      summary: Trouble List
//  *      parameters:
//  *        - name: status
//  *          in: query
//  *          description: 'query with status. '
//  *          schema:
//  *            type: string
//  *        - name: searchCharName
//  *          in: query
//  *          description: 'search CharName'
//  *          schema:
//  *            type: string
//  *      responses:
//  *        200:
//  *          description: Response successfully
//  *          content:
//  *            application/json:
//  *              schema:
//  *                type: object
//  *                properties:
//  *                  totalCount:
//  *                    type: integer
//  *                    default: 1
//  *                  result:
//  *                    type: array
//  *                    items:
//  *                      $ref: '#/components/schemas/Trouble'
//  */
// router.get(
//   "/trouble",
//   awsTokenDecoder(listAction.checkToken),
//   roleCheck(listAction.roles),
//   listAction.validator,
//   listAction.service,
//   listAction.errorHandler
// );

// /**
//  *  @openapi
//  *  /trouble/{troubleId}:
//  *    get:
//  *      tags:
//  *        - Trouble Report
//  *      summary: Find trouble by ID
//  *      parameters:
//  *        - name: troubleId
//  *          in: path
//  *          description: troubleId
//  *          required: true
//  *          example: 10
//  *          schema:
//  *            type: string
//  *      responses:
//  *        200:
//  *          description: Response successfully
//  *          content:
//  *            application/json:
//  *              schema:
//  *                type: object
//  *                properties:
//  *                  result:
//  *                    $ref: '#/components/schemas/Trouble'
//  *        404:
//  *          description: Not found
//  *          content:
//  *            application/json:
//  *              schema:
//  *                $ref: '#/components/schemas/TroubleError404'
//  */
// router.get(
//   "/trouble/:troubleId",
//   awsTokenDecoder(readAction.checkToken),
//   roleCheck(readAction.roles),
//   readAction.validator,
//   readAction.service,
//   readAction.errorHandler
// );

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
  "/trouble",
  authMiddleware.checkToken(createAction.checkToken),
  roleMiddleware.checkRoles(createAction.roles),
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
  "/trouble/:troubleId",
  authMiddleware.checkToken(updateAction.checkToken),
  roleMiddleware.checkRoles(updateAction.roles),
  updateAction.validator,
  updateAction.service,
  updateAction.errorHandler
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
  "/trouble/:troubleId",
  authMiddleware.checkToken(deleteAction.checkToken),
  roleMiddleware.checkRoles(deleteAction.roles),
  deleteAction.validator,
  deleteAction.service,
  deleteAction.errorHandler
);

// /**
//  *  @openapi
//  *  /trouble/exportExcel:
//  *    get:
//  *      tags:
//  *        - Trouble Report
//  *      summary: export Excel trouble
//  *      responses:
//  *        200:
//  *          description: Response successfully
//  */
// router.get(
//   "/trouble/exportExcel",
//   awsTokenDecoder(exportExcelAcction.checkToken),
//   roleCheck(exportExcelAcction.roles),
//   exportExcelAcction.validator,
//   exportExcelAcction.service,
//   exportExcelAcction.errorHandler
// );

module.exports = router;
