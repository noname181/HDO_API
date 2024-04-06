const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const sequelize = require('sequelize');
const { Sequelize } = require('sequelize');
const axios = require('axios');
const net = require('net');
const { sendLmsFunc } = require('./sendLmsFunc');

const sendMessage = {
  path: '/web/cs-sms',
  method: 'post',
  checkToken: false,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { body } = request;
  const { phoneNo, text_message, subject } = body;
  try {
    const { rsp, sms_cd } = await sendLmsFunc(request.user.id, phoneNo, text_message, subject);
    if (sms_cd === 'EW' || sms_cd === 'SS') {
      response.status(HTTP_STATUS_CODE.OK).json('SMS SUCCESS');
    } else {
      throw 'SEND_SMS_ERROR';
    }
  } catch (error) {
    console.error('sendMessage::service::', error);
    next('SEND_SMS_ERROR');
  }
}

function validator(request, response, next) {
  const { body } = request;

  if (!body || !body.phoneNo || !body.text_message) {
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

  if (error === 'SEND_SMS_ERROR') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '문자 메세지 전달에 실패하였습니다.',
    });
  }
  next();
}

module.exports = { sendMessage };
