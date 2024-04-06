const router = require('express').Router();

const createOrganization = require('../../api/organization/create-org');
const getOrganizations = require('../../api/organization/read-orgs');
const getOrganizationById = require('../../api/organization/read-org-by-id');
const getUnregisteredChargingStationOrgs = require('../../api/organization/read-unregistered-charging-station-orgs');
const updateOrganizationById = require('../../api/organization/update-org-by-id');
const deleteOrganizationById = require('../../api/organization/delete-org-by-id');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger'); 

const { configuration } = require('../../config/config');
const { TokenService } = require('../../util/tokenService');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');

// New logic authen with JWT
const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

/**
 *  @openapi
 *  /orgs:
 *    post:
 *      tags:
 *        - ORG
 *      summary: organization create
 *      requestBody:
 *        description: organization create
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/OrganizationCreatePayload'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/OrganizationCreatePayload'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/OrganizationCreatePayload'
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/OrganizationResponse'
 */
router.post(
  '/orgs',
  authMiddleware.checkToken(createOrganization.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createOrganization.roles, createOrganization.permissions, createOrganization.checkToken),
  createOrganization.validator,
  createOrganization.service,
  createOrganization.errorHandler
);

/**
 *  @openapi
 *  /orgs:
 *    get:
 *      tags:
 *        - ORG
 *      summary: get organization
 *      parameters:
 *        - name: page
 *          in: query
 *          description: page
 *          example: 1
 *          schema:
 *            type: string
 *        - name: rpp
 *          in: query
 *          description: rpp
 *          example: 999
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
 *                    $ref: '#/components/schemas/OrganizationResponse'
 */
router.get(
  '/orgs',
  authMiddleware.checkToken(getOrganizations.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(getOrganizations.roles, getOrganizations.permissions, getOrganizations.checkToken),
  getOrganizations.validator,
  getOrganizations.service,
  getOrganizations.errorHandler
);

/**
 *  @openapi
 *  /orgs/{orgId}:
 *    get:
 *      tags:
 *        - ORG
 *      summary: get organization by id
 *      parameters:
 *        - name: orgId
 *          in: path
 *          description: orgId
 *          example: 1
 *          schema:
 *            type: string
 *        - name: page
 *          in: query
 *          description: page
 *          example: 1
 *          schema:
 *            type: string
 *        - name: rpp
 *          in: query
 *          description: rpp
 *          example: 999
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
 *                    $ref: '#/components/schemas/OrganizationResponse'
 */
router.get(
  '/orgs/:orgId',
  authMiddleware.checkToken(getOrganizationById.checkToken),
  userActionLogMiddleware(false,getOrganizationById.status),
  newRoleMiddleware.checkRoles(
    getOrganizationById.roles,
    getOrganizationById.permissions,
    getOrganizationById.checkToken
  ),
  getOrganizationById.validator,
  getOrganizationById.service,
  getOrganizationById.errorHandler
);

/**
 *  @openapi
 *  /orgs/unregister/charging-station:
 *    get:
 *      tags:
 *        - ORG
 *      summary: get organization by id
 *      parameters:
 *        - name: page
 *          in: query
 *          description: page
 *          example: 1
 *          schema:
 *            type: string
 *        - name: rpp
 *          in: query
 *          description: rpp
 *          example: 999
 *          schema:
 *            type: string
 *        - name: name
 *          in: query
 *          description: name
 *          example: "test"
 *          schema:
 *            type: string
 *        - name: contact
 *          in: query
 *          description: contact
 *          example: "test"
 *          schema:
 *            type: string
 *        - name: odby
 *          in: query
 *          description: odby
 *          example: "DESC"
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
 *                    $ref: '#/components/schemas/OrganizationResponse'
 */
router.get(
  '/orgs/unregister/charging-station',
  authMiddleware.checkToken(getUnregisteredChargingStationOrgs.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    getUnregisteredChargingStationOrgs.roles,
    getUnregisteredChargingStationOrgs.permissions,
    getUnregisteredChargingStationOrgs.checkToken
  ),
  getUnregisteredChargingStationOrgs.validator,
  getUnregisteredChargingStationOrgs.service,
  getUnregisteredChargingStationOrgs.errorHandler
);

/**
 *  @openapi
 *  /orgs/{orgId}:
 *    put:
 *      tags:
 *        - ORG
 *      summary: organization update
 *      parameters:
 *        - name: orgId
 *          in: path
 *          description: orgId
 *          example: 1
 *          schema:
 *            type: string
 *      requestBody:
 *        description: organization update
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/OrganizationUpdatePayload'
 *          application/xml:
 *            schema:
 *              $ref: '#/components/schemas/OrganizationUpdatePayload'
 *          application/x-www-form-urlencoded:
 *            schema:
 *              $ref: '#/components/schemas/OrganizationUpdatePayload'
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/OrganizationResponse'
 */
router.put(
  '/orgs/:orgId',
  authMiddleware.checkToken(updateOrganizationById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    updateOrganizationById.roles,
    updateOrganizationById.permissions,
    updateOrganizationById.checkToken
  ),
  updateOrganizationById.validator,
  updateOrganizationById.service,
  updateOrganizationById.errorHandler
);

/**
 *  @openapi
 *  /orgs/{orgId}:
 *    delete:
 *      tags:
 *        - ORG
 *      summary: organization update
 *      parameters:
 *        - name: orgId
 *          in: path
 *          description: orgId
 *          example: 1
 *          schema:
 *            type: string\
 *        - name: force
 *          in: query
 *          description: force
 *          example: false
 *      responses:
 *        200:
 *          description: Response successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    $ref: '#/components/schemas/OrganizationResponse'
 */
router.delete(
  '/orgs/:orgId',
  authMiddleware.checkToken(deleteOrganizationById.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    deleteOrganizationById.roles,
    deleteOrganizationById.permissions,
    deleteOrganizationById.checkToken
  ),
  deleteOrganizationById.validator,
  deleteOrganizationById.service,
  deleteOrganizationById.errorHandler
);

module.exports = router;
