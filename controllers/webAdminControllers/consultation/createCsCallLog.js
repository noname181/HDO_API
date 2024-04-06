const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const sequelize = require('sequelize');
const { Sequelize } = require('sequelize');
const { sendSMS } = require('../../../util/smsUtil');

const createCsCallLog = {
  path: '/web/cs-call-log',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { body } = request;
  const { regNo, agentId, csEvent, csState, callType, cid, uniqueId, recordFile, extensionNumber } = body;

  try {
    const callLog = await models.CsCallLog.create({
      regNo,
      agentId,
      csEvent,
      csState,
      callType,
      cid,
      uniqueId,
      recordFile,
      extensionNumber,
    });

    response.status(HTTP_STATUS_CODE.CREATE).json(callLog);
  } catch (error) {
    console.error('createCsCallLog::service::', error);
    next(error);
  }
}

function validator(request, response, next) {
  const { body } = request;

  if (!body || !body.agentId || !body.csEvent) {
    throw 'NO_REQUIRED_INPUT';
  }
  next();
}

function errorHandler(error, request, response, next) {
  console.log('error::', error);
  if (error === 'NO_REQUIRED_INPUT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '필수 입력 정보가 누락되었습니다.',
    });
  }
  next();
}

module.exports = { createCsCallLog };
