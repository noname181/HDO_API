const router = require('express').Router();
const {
  createAction,
  readPaymentHistory,
  deleteBatchPaymentHistory,
  readPaymentHistoryByUserId,
  readTotalPaymentHistoryInMonth,
  readUnpaidPaymentByUserId,
  readPaymentHistoryDetails,
  readOutstandingPayment,
  readOutstandingPaymentDetail,
  readChargerHistory,
} = require('../../api/payment');

const RequestUnpaidPayment = require('../../api/interface-ocpp/request-unpaid-payment');

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

router.post(
  createAction.path,
  authMiddleware.checkToken(createAction.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(createAction.roles, createAction.permissions, createAction.checkToken),
  createAction.validator,
  createAction.service,
  createAction.errorHandler
);

router.delete(
  deleteBatchPaymentHistory.path,
  authMiddleware.checkToken(deleteBatchPaymentHistory.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    deleteBatchPaymentHistory.roles,
    deleteBatchPaymentHistory.permissions,
    deleteBatchPaymentHistory.checkToken
  ),
  deleteBatchPaymentHistory.validator,
  deleteBatchPaymentHistory.service,
  deleteBatchPaymentHistory.errorHandler
);

router.get(
  readPaymentHistory.path,
  authMiddleware.checkToken(readPaymentHistory.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readPaymentHistory.roles, readPaymentHistory.permissions, readPaymentHistory.checkToken),
  readPaymentHistory.validator,
  readPaymentHistory.service,
  readPaymentHistory.errorHandler
);

router.get(
  readPaymentHistoryDetails.path,
  authMiddleware.checkToken(readPaymentHistoryDetails.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readPaymentHistoryDetails.roles,
    readPaymentHistoryDetails.permissions,
    readPaymentHistoryDetails.checkToken
  ),
  readPaymentHistoryDetails.validator,
  readPaymentHistoryDetails.service,
  readPaymentHistoryDetails.errorHandler
);

router.get(
  readPaymentHistoryByUserId.path,
  authMiddleware.checkToken(readPaymentHistoryByUserId.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readPaymentHistoryByUserId.roles,
    readPaymentHistoryByUserId.permissions,
    readPaymentHistoryByUserId.checkToken
  ),
  readPaymentHistoryByUserId.validator,
  readPaymentHistoryByUserId.service,
  readPaymentHistoryByUserId.errorHandler
);

router.get(
  readTotalPaymentHistoryInMonth.path,
  authMiddleware.checkToken(readTotalPaymentHistoryInMonth.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readTotalPaymentHistoryInMonth.roles,
    readTotalPaymentHistoryInMonth.permissions,
    readTotalPaymentHistoryInMonth.checkToken
  ),
  readTotalPaymentHistoryInMonth.validator,
  readTotalPaymentHistoryInMonth.service,
  readTotalPaymentHistoryInMonth.errorHandler
);

router.get(
  readUnpaidPaymentByUserId.path,
  authMiddleware.checkToken(readUnpaidPaymentByUserId.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readUnpaidPaymentByUserId.roles,
    readUnpaidPaymentByUserId.permissions,
    readUnpaidPaymentByUserId.checkToken
  ),
  readUnpaidPaymentByUserId.validator,
  readUnpaidPaymentByUserId.service,
  readUnpaidPaymentByUserId.errorHandler
);

router.post(
  RequestUnpaidPayment.path,
  authMiddleware.checkToken(RequestUnpaidPayment.checkToken),
  userActionLogMiddleware(false),
  roleMiddleware.checkRoles(RequestUnpaidPayment.roles),
  RequestUnpaidPayment.validator,
  RequestUnpaidPayment.service,
  RequestUnpaidPayment.errorHandler
);

router.get(
  readOutstandingPayment.path,
  authMiddleware.checkToken(readOutstandingPayment.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readOutstandingPayment.roles,
    readOutstandingPayment.permissions,
    readOutstandingPayment.checkToken
  ),
  readOutstandingPayment.validator,
  readOutstandingPayment.service,
  readOutstandingPayment.errorHandler
);

router.get(
  readOutstandingPaymentDetail.path,
  authMiddleware.checkToken(readOutstandingPaymentDetail.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(
    readOutstandingPaymentDetail.roles,
    readOutstandingPaymentDetail.permissions,
    readOutstandingPaymentDetail.checkToken
  ),
  readOutstandingPaymentDetail.validator,
  readOutstandingPaymentDetail.service,
  readOutstandingPaymentDetail.errorHandler
);

router.get(
  readChargerHistory.path,
  authMiddleware.checkToken(readChargerHistory.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(readChargerHistory.roles, readChargerHistory.permissions, readChargerHistory.checkToken),
  readChargerHistory.validator,
  readChargerHistory.service,
  readChargerHistory.errorHandler
);

module.exports = router;
