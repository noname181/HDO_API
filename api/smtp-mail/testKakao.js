'use strict';
const express = require('express');
const { sendTalk } = require('../../controllers/webAdminControllers/consultation/sendTalk');
const {
  sendRegCmpMsg,
  sendRefMsg,
  sendChgStrtMsg,
  sendRefundMsg,
  sendComChgMsg,
  sendChgHisMsg,
} = require('../../util/notificationTalk/notificationTemplate');

module.exports = {
  path: ['/testTalk'],
  method: 'post',
  checkToken: true,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  console.log('확인');
  console.log(_request.user);
  const userId = _request.user?.id;
  console.log(userId, '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

  const { phoneNum, checkTalk } = _request.body;
  console.log(_request.body);
  let tempData = '';

  if (checkTalk.toString().trim() === '1') {
    tempData = sendRegCmpMsg('고객 이름', '회원가입일', '1551-1581');
    sendTalk(tempData, phoneNum, userId);
  } else if (checkTalk.toString().trim() === '2') {
    tempData = sendRefMsg('충전시작', '충전종료', '충전소ID', '1000', '1000', '1000', '1551-1581');
    sendTalk(tempData, phoneNum, userId);
  } else if (checkTalk.toString().trim() === '3') {
    tempData = sendChgStrtMsg('1000', '1000', '1551-1581');
    sendTalk(tempData, phoneNum, userId);
  } else if (checkTalk.toString().trim() === '4') {
    tempData = sendRefundMsg('1000');
    sendTalk(tempData, phoneNum, userId);
  } else if (checkTalk.toString().trim() === '5') {
    tempData = sendComChgMsg('1000', '1000', '1000', '1000');
    sendTalk(tempData, phoneNum, userId);
  } else if (checkTalk.toString().trim() === '6') {
    tempData = sendChgHisMsg('1000', '1000', '1000', '1000', '1000', '1000', '15511581');
    sendTalk(tempData, phoneNum, userId);
  }

  //   try {
  //     await transporter.sendMail(mailOptions);
  //     logger.info('메일 전송 성공');
  //     _response.json({ success: '메일 전송 성공' });
  //   } catch (error) {
  //     const errorMessage = `메일 전송 오류: ${error.message}`;
  //     // _response.status(500).json({ error: error.message });
  //     logger.error(
  //       `메일 전송 오류 - 요청 서버 IP: ${serverIpAddress}, SMTP 서버 IP: ${smtpServerAddress}, 오류: ${error.message}`
  //     );
  //     logger.debug(`메일 전송 실패 상세 정보: ${error.stack}`);
  //     const ipCheckLog = `메일 전송 오류 - 요청 서버 IP: ${serverIpAddress}, SMTP 서버 IP: ${smtpServerAddress}, 오류: ${error.message}`;
  //     _response.status(500).json({
  //       error: errorMessage,
  //       debugInfo: error.stack,
  //       logMessage: ipCheckLog,
  //     });
  //   }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  _response.status(500).json({ error: '서버 내부 오류' });
}
