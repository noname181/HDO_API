const router = require('express').Router();
const readSettlement  = require('../../api/settlement/read-settlement'); 
const readSettlementDetail  = require('../../api/settlement/read-settlement-detail');
const erpResendSettlementDetail  = require('../../api/settlement/erp-resend-settlement-detail-by-id');
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

router.get(
  readSettlement.path,
  authMiddleware.checkToken(readSettlement.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readSettlement.roles, readSettlement.permissions, readSettlement.checkToken),
  readSettlement.validator,
  readSettlement.service,
  readSettlement.errorHandler
);

router.get(
  readSettlementDetail.path,
  authMiddleware.checkToken(readSettlementDetail.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readSettlementDetail.roles, readSettlementDetail.permissions, readSettlementDetail.checkToken),
  readSettlementDetail.validator,
  readSettlementDetail.service,
  readSettlementDetail.errorHandler
);

router.post(
    erpResendSettlementDetail.path,
    authMiddleware.checkToken(erpResendSettlementDetail.checkToken),
    userActionLogMiddleware(false),
    newRoleMiddleware.checkRoles(erpResendSettlementDetail.roles, erpResendSettlementDetail.permissions, erpResendSettlementDetail.checkToken),
    erpResendSettlementDetail.validator,
    erpResendSettlementDetail.service,
    erpResendSettlementDetail.errorHandler
);

module.exports = router;
