const router = require('express').Router();
const { getCsList } = require('../../controllers/webAdminControllers/consultation/getCsList');
const { getCustomer } = require('../../controllers/webAdminControllers/consultation/getCustomer');
const { getTransfer } = require('../../controllers/webAdminControllers/consultation/getTransfer');
const { getScript } = require('../../controllers/webAdminControllers/consultation/getScript');
const { getConsultation } = require('../../controllers/webAdminControllers/consultation/getConsultation');
const { getCsStatistics } = require('../../controllers/webAdminControllers/consultation/getCsStatistics');
const { getCsCallLog } = require('../../controllers/webAdminControllers/consultation/getCsCallLog');
const { getCsLog } = require('../../controllers/webAdminControllers/consultation/getCsLog');
const { getVehicle } = require('../../controllers/webAdminControllers/consultation/getVehicle');
const { getPaymentLogs } = require('../../controllers/webAdminControllers/consultation/getPaymentLogs');
const { createConsultation } = require('../../controllers/webAdminControllers/consultation/createConsultation');
const { updateConsultation } = require('../../controllers/webAdminControllers/consultation/updateConsultation');
const { updateScript } = require('../../controllers/webAdminControllers/consultation/updateScript');
const { createMessage } = require('../../controllers/webAdminControllers/consultation/createMessage');
const { createCsCallLog } = require('../../controllers/webAdminControllers/consultation/createCsCallLog');
const { sendMessage } = require('../../controllers/webAdminControllers/consultation/sendMessage');
const { sendLms } = require('../../controllers/webAdminControllers/consultation/sendLms');
const { createTransfer } = require('../../controllers/webAdminControllers/consultation/createTransfer');
const { resetPassword } = require('../../controllers/webAdminControllers/consultation/resetPassword');
const { getAsOrg } = require('../../controllers/webAdminControllers/consultation/getAsOrg');
const { getRefundAmount } = require('../../controllers/webAdminControllers/consultation/getRefundAmount');
const { getCsDashBoard } = require('../../controllers/webAdminControllers/consultation/getCsDashBoard');
const { getCallCdrs } = require('../../controllers/webAdminControllers/consultation/getCallCdrs');
const { getCallList } = require('../../controllers/webAdminControllers/consultation/getCallList');

const { configuration } = require('../../config/config');
const { AuthMiddleware } = require('../../middleware/auth.middleware');
const { TokenService } = require('../../util/tokenService');
const { RoleMiddleware } = require('../../middleware/role.middleware');
const { permissionMiddleware } = require('../../middleware/permission.middleware');
const { NewRoleMiddleware } = require('../../middleware/newRole.middleware');
const { userActionLogMiddleware } = require('../../middleware/user-action-logger');

const config = configuration();
const tokenService = new TokenService(config);
const authMiddleware = new AuthMiddleware(config, tokenService);
const roleMiddleware = new RoleMiddleware();
const newRoleMiddleware = new NewRoleMiddleware();

router.get(
  getCallList.path,
  authMiddleware.checkToken(getCallList.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(getCallList.roles, getCallList.permissions),
  getCallList.validator,
  getCallList.service,
  getCallList.errorHandler
);

router.get(
  getCsDashBoard.path,
  authMiddleware.checkToken(getCsDashBoard.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(getCsDashBoard.roles, getCsDashBoard.permissions),
  getCsDashBoard.validator,
  getCsDashBoard.service,
  getCsDashBoard.errorHandler
);

router.get(
  getRefundAmount.path,
  authMiddleware.checkToken(getRefundAmount.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(getRefundAmount.roles, getRefundAmount.permissions),
  getRefundAmount.validator,
  getRefundAmount.service,
  getRefundAmount.errorHandler
);

router.get(
  getCallCdrs.path,
  authMiddleware.checkToken(getCallCdrs.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getCallCdrs.roles, getCallCdrs.permissions),
  getCallCdrs.validator,
  getCallCdrs.service,
  getCallCdrs.errorHandler
);

router.get(
  getCsList.path,
  authMiddleware.checkToken(getCsList.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getCsList.roles, getCsList.permissions, getCsList.checkToken),
  newRoleMiddleware.checkRoles(getCsList.roles, getCsList.permissions),
  getCsList.validator,
  getCsList.service,
  getCsList.errorHandler
);

router.get(
  getAsOrg.path,
  authMiddleware.checkToken(getAsOrg.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(getAsOrg.roles, getAsOrg.permissions),
  getAsOrg.validator,
  getAsOrg.service,
  getAsOrg.errorHandler
);

router.get(
  getCustomer.path,
  authMiddleware.checkToken(getCustomer.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getCustomer.roles, getCustomer.permissions, getCustomer.checkToken),
  newRoleMiddleware.checkRoles(getCustomer.roles, getCustomer.permissions),
  getCustomer.validator,
  getCustomer.service,
  getCustomer.errorHandler
);

router.get(
  getTransfer.path,
  authMiddleware.checkToken(getTransfer.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getTransfer.roles, getTransfer.permissions, getTransfer.checkToken),
  newRoleMiddleware.checkRoles(getTransfer.roles, getTransfer.permissions),
  getTransfer.validator,
  getTransfer.service,
  getTransfer.errorHandler
);

router.get(
  getScript.path,
  authMiddleware.checkToken(getScript.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getScript.roles, getScript.permissions, getScript.checkToken),
  newRoleMiddleware.checkRoles(getScript.roles, getScript.permissions),
  getScript.validator,
  getScript.service,
  getScript.errorHandler
);

router.get(
  getConsultation.path,
  authMiddleware.checkToken(getConsultation.checkToken),
  userActionLogMiddleware(false, getConsultation.status),
  // newRoleMiddleware.checkRoles(getConsultation.roles, getConsultation.permissions, getConsultation.checkToken),
  newRoleMiddleware.checkRoles(getConsultation.roles, getConsultation.permissions),
  getConsultation.validator,
  getConsultation.service,
  getConsultation.errorHandler
);

router.get(
  getVehicle.path,
  authMiddleware.checkToken(getVehicle.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getVehicle.roles, getVehicle.permissions, getVehicle.checkToken),
  newRoleMiddleware.checkRoles(getVehicle.roles, getVehicle.permissions),
  getVehicle.validator,
  getVehicle.service,
  getVehicle.errorHandler
);

router.get(
  getPaymentLogs.path,
  authMiddleware.checkToken(getPaymentLogs.checkToken), //TESTONLY
  // newRoleMiddleware.checkRoles(getPaymentLogs.roles, getPaymentLogs.permissions, getPaymentLogs.checkToken),
  newRoleMiddleware.checkRoles(getPaymentLogs.roles, getPaymentLogs.permissions),
  getPaymentLogs.validator,
  getPaymentLogs.service,
  getPaymentLogs.errorHandler
);

router.post(
  createConsultation.path,
  authMiddleware.checkToken(createConsultation.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(createConsultation.roles, createConsultation.permissions, createConsultation.checkToken),
  newRoleMiddleware.checkRoles(createConsultation.roles, createConsultation.permissions),
  createConsultation.validator,
  createConsultation.service,
  createConsultation.errorHandler
);

router.put(
  updateConsultation.path,
  authMiddleware.checkToken(updateConsultation.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(updateConsultation.roles, updateConsultation.permissions, updateConsultation.checkToken),
  newRoleMiddleware.checkRoles(updateConsultation.roles, updateConsultation.permissions),
  updateConsultation.validator,
  updateConsultation.service,
  updateConsultation.errorHandler
);

router.put(
  updateScript.path,
  authMiddleware.checkToken(updateScript.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(updateScript.roles, updateScript.permissions, updateScript.checkToken),
  newRoleMiddleware.checkRoles(updateScript.roles, updateScript.permissions),
  updateScript.validator,
  updateScript.service,
  updateScript.errorHandler
);

router.post(
  createMessage.path,
  authMiddleware.checkToken(createMessage.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(createMessage.roles, createMessage.permissions, createMessage.checkToken),
  newRoleMiddleware.checkRoles(createMessage.roles, createMessage.permissions),
  createMessage.validator,
  createMessage.service,
  createMessage.errorHandler
);

router.post(
  sendMessage.path,
  authMiddleware.checkToken(sendMessage.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(sendMessage.roles, sendMessage.permissions, sendMessage.checkToken),
  newRoleMiddleware.checkRoles(sendMessage.roles, sendMessage.permissions),
  sendMessage.validator,
  sendMessage.service,
  sendMessage.errorHandler
);

router.post(
  sendLms.path,
  authMiddleware.checkToken(sendLms.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(sendLms.roles, sendLms.permissions, sendLms.checkToken),
  newRoleMiddleware.checkRoles(sendLms.roles, sendLms.permissions),
  sendLms.validator,
  sendLms.service,
  sendLms.errorHandler
);

router.post(
  createTransfer.path,
  authMiddleware.checkToken(createTransfer.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(createTransfer.roles, createTransfer.permissions, createTransfer.checkToken),
  newRoleMiddleware.checkRoles(createTransfer.roles, createTransfer.permissions),
  createTransfer.validator,
  createTransfer.service,
  createTransfer.errorHandler
);

router.put(
  resetPassword.path,
  authMiddleware.checkToken(resetPassword.checkToken),
  userActionLogMiddleware(false),
  newRoleMiddleware.checkRoles(resetPassword.roles, resetPassword.permissions),
  resetPassword.validator,
  resetPassword.service,
  resetPassword.errorHandler
);

router.post(
  createCsCallLog.path,
  authMiddleware.checkToken(createCsCallLog.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(createCsCallLog.roles, createCsCallLog.permissions, createCsCallLog.checkToken),
  newRoleMiddleware.checkRoles(createCsCallLog.roles, createCsCallLog.permissions),
  createCsCallLog.validator,
  createCsCallLog.service,
  createCsCallLog.errorHandler
);

router.get(
  getCsStatistics.path,
  authMiddleware.checkToken(getCsStatistics.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getCsStatistics.roles, getCsStatistics.permissions, getCsStatistics.checkToken),
  newRoleMiddleware.checkRoles(getCsStatistics.roles, getCsStatistics.permissions),
  getCsStatistics.validator,
  getCsStatistics.service,
  getCsStatistics.errorHandler
);

router.get(
  getCsLog.path,
  authMiddleware.checkToken(getCsLog.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getCsLog.roles, getCsLog.permissions, getCsLog.checkToken),
  newRoleMiddleware.checkRoles(getCsLog.roles, getCsLog.permissions),
  getCsLog.validator,
  getCsLog.service,
  getCsLog.errorHandler
);

router.get(
  getCsCallLog.path,
  authMiddleware.checkToken(getCsCallLog.checkToken),
  userActionLogMiddleware(false),
  // newRoleMiddleware.checkRoles(getCsCallLog.roles, getCsCallLog.permissions, getCsCallLog.checkToken),
  newRoleMiddleware.checkRoles(getCsCallLog.roles, getCsCallLog.permissions),
  getCsCallLog.validator,
  getCsCallLog.service,
  getCsCallLog.errorHandler
);

module.exports = router;
