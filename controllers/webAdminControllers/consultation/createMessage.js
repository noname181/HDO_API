const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const sequelize = require('sequelize');
const { Sequelize } = require('sequelize');
const { sendSMS } = require('../../../util/smsUtil');

const createMessage = {
  path: '/web/cs-message',
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
  const { regNo, phoneNo, text_message, createdWho, csId } = body;

  try {
    const smsResult = await sendSMS(phoneNo, text_message);

    if (smsResult === 'SUCCESS') {
      const message = await models.CsMessage.create({ regNo, phoneNo, text_message, createdWho, csId });

      response.status(HTTP_STATUS_CODE.CREATE).json(message);
    } else {
      throw 'SMS_FAIL';
    }
  } catch (error) {
    console.error('createMessage::service::', error);
    next(error);
  }
}

function validator(request, response, next) {
  const { body } = request;

  if (!body || !body.phoneNo || !body.text_message || !body.createdWho) {
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
  if (error === 'SMS_FAIL') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '문자 메세지 발송에 실패하였습니다.',
    });
  }
  next();
}

module.exports = { createMessage };
