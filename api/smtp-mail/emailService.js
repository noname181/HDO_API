/**
 * Created by inju on 2023-09-26.
 * emailService
 */
'use strict';
const express = require('express');
const nodemailer = require('nodemailer');
const winston = require('winston');
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const os = require('os');
const dns = require('dns');
const { EmailService } = require('../../services/emailService/emailService');
const { configuration } = require('../../config/config');
const { LoggerService } = require('../../services/loggerService/loggerService');

// 로깅 설정
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: '465',
//   secure: true,
//   // auth: {
//   //   user: 'dlswn666@caelumglobal.com',
//   //   pass: 'qeoewtggfklgmvct',
//   // },
//   // host: 'smtp.naver.com',
//   // port: 465,
//   // secure: true, // use SSL
// });

module.exports = {
  path: ['/email-service'],
  method: 'post',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  console.log('확인');

  const { userEmail, sendEmailAdd, userInfo, template, host, port, secure } = _request.body;

  if (!sendEmailAdd || !userInfo) {
    logger.error('필수 파라미터가 누락됨.');
    return _response.status(400).json({ error: '필수 파라미터가 누락됨.' });
  }

  const serverIpAddress = getServerIpAddress();

  // SMTP 서버 IP 주소 확인
  // let smtpServerAddress = '';
  // try {
  //   smtpServerAddress = await new Promise((resolve, reject) => {
  //     resolveSmtpServerAddress(host, (err, address) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(address);
  //       }
  //     });
  //   });
  // } catch (error) {
  //   logger.error(`SMTP 서버 IP 주소 확인 실패: ${error}`);
  //   return _response.status(500).json({ error: `SMTP 서버 IP 주소 확인 실패: ${error}` });
  // }

  // const transporterConfig = {
  //   host: host,
  //   port: port,
  //   secure: secure,
  //   tls: {
  //     rejectUnauthorized: false,
  //     minVersion: 'TLSv1.2',
  //     maxVersion: 'TLSv1.2',
  //   },
  // };

  // const transporter = nodemailer.createTransport(transporterConfig);

  // const mailOptions = {
  //   from: userEmail,
  //   to: sendEmailAdd,
  //   subject: '테스트메일',
  //   html: template.replace(/{{userInfo}}/g, userInfo),
  // };

  const config = configuration();
  const loggerService = new LoggerService();
  const emailServiceInstance = new EmailService(config, loggerService);

  const subject = 'EV&U 비밀번호 설정';
  try {
    await emailServiceInstance.sendWithTemplateTemp(sendEmailAdd, subject, userInfo);
    logger.info('메일 전송 성공');
    _response.json({ success: '메일 전송 성공' });
  } catch (error) {
    const errorMessage = `메일 전송 오류: ${error.message}`;
    // _response.status(500).json({ error: error.message });
    logger.error(
      `메일 전송 오류 - 요청 서버 IP: ${serverIpAddress}, SMTP 서버 IP: ${smtpServerAddress}, 오류: ${error.message}`
    );
    logger.debug(`메일 전송 실패 상세 정보: ${error.stack}`);
    const ipCheckLog = `메일 전송 오류 - 요청 서버 IP: ${serverIpAddress}, SMTP 서버 IP: ${smtpServerAddress}, 오류: ${error.message}`;
    _response.status(500).json({
      error: errorMessage,
      debugInfo: error.stack,
      logMessage: ipCheckLog,
    });
  }
}

function getServerIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if ('IPv4' === iface.family && !iface.internal) {
        return iface.address;
      }
    }
  }
}

function resolveSmtpServerAddress(smtpHost, callback) {
  dns.lookup(smtpHost, (err, address) => {
    if (err) {
      callback(err);
    } else {
      callback(null, address);
    }
  });
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  _response.status(500).json({ error: '서버 내부 오류' });
}
