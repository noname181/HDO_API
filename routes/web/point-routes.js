const router = require('express').Router();
const { listAction, deleteBatchPoint } = require('../../api/point');

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
 *  /point:
 *    get:
 *      tags:
 *        - Point
 *      summary: Point list
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
 *                      $ref: '#/components/schemas/Point'
 */
router.get(
  '/point',
  authMiddleware.checkToken(listAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(listAction.roles, listAction.permissions, listAction.checkToken),
  listAction.validator,
  listAction.service,
  listAction.errorHandler
);

router.delete(
  deleteBatchPoint.path,
  authMiddleware.checkToken(deleteBatchPoint.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(deleteBatchPoint.roles, deleteBatchPoint.permissions, deleteBatchPoint.checkToken),
  deleteBatchPoint.validator,
  deleteBatchPoint.service,
  deleteBatchPoint.errorHandler
);

module.exports = router;
