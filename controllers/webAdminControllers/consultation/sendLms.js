const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const sequelize = require('sequelize');
const { Sequelize } = require('sequelize');
const axios = require('axios');
const net = require('net');
const { createMessageLogsFunc } = require('./createMessageLogsFunc');
const { parseTimestamp } = require('../../../util/parseTimestampToDateTime');

const sendLms = {
  path: '/web/cs-lms',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const testConnection = new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(8443, 'wt-api.carrym.com', function () {
      client.end();
      resolve(true);
    });
    client.on('error', function (err) {
      client.end();
      reject(false);
    });
  });

  try {
    const isFirewallOpen = await testConnection;
    if (isFirewallOpen) {
      console.log('방화벽 확인: 뚫려 있음');
    }
  } catch (err) {
    console.log('방화벽 확인: 막힘');
    return response.status(HTTP_STATUS_CODE.SERVICE_UN_AVAILABLE).json('방화벽 문제로 서비스를 사용할 수 없습니다.');
  }

  const { body } = request;
  const { phoneNo, text_message, subject } = body;
  if (!subject?.toString().trim()) {
    subject = 'HDO현대오일뱅크';
  }

  const url = 'https://wt-api.carrym.com:8443/v3/L/hdhyundaioilbank2/messages';
  const headers = {
    'Content-Type': 'application/json',
    charset: 'utf-8',
    Authorization: `Bearer ${process.env.KAKAO_CLIENT_KEY}`,
  }; // TODO
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(date.getFullYear());
  const data = [
    {
      custMsgSn: `SOME_UNIQUE_KEY_${year}${month}${day}_${Math.floor(Math.random() * 9999990) + 10}`,
      phoneNum: phoneNo,
      smsSndNum: '15515129',
      senderKey: 'hdhyundaioilbank2',
      message: text_message,
      subject: subject,
    },
  ];

  try {
    const rsp = await axios.post(url, data, { headers });
    console.log(`LMS1 SEND response.data => ${JSON.stringify(rsp.data)}`);
    const sms_cd = rsp.data[0].code;
    if (sms_cd === 'EW' || sms_cd === 'SS') {
      await createMessageLogsFunc(
        request.user.id,
        null,
        text_message,
        phoneNo,
        parseTimestamp(rsp.data[0].sndDtm),
        'S',
        'MESSAGE',
        '15515129'
      );
      response.status(HTTP_STATUS_CODE.OK).json('LMS SUCCESS');
    } else {
      await createMessageLogsFunc(
        request.user.id,
        null,
        text_message,
        phoneNo,
        parseTimestamp(rsp.data[0].sndDtm),
        'F',
        'MESSAGE',
        '15515129'
      );
      response.json({ status: 'error', data: rsp.data });
      throw 'SEND_LMS1_ERROR';
    }
  } catch (error) {
    console.error('sendMessage::service::', error);
    next('SEND_LMS1_ERROR');
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

  if (error === 'SEND_LMS1_ERROR') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '문자 메세지 전달에 실패하였습니다.',
    });
  }
  next();
}

module.exports = { sendLms };
