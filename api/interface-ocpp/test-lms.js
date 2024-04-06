/**
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const axios = require("axios");
const net = require('net');

module.exports = {
  path: ["/test-lms"],
  method: "post",
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { phoneNo, text_message } = _request.body
  try {
    if (!phoneNo) throw "NEED_PHONENO"
    if (!text_message) throw "TEXT_MESSAGE"

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
      throw new Error('방화벽 문제로 서비스를 사용할 수 없습니다.');
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
        smsSndNum: '15885189',
        message: text_message,
      },
    ];

    const response = await axios.post(url, data, { headers, timeout:8000 } );

    _response.json({
      status: "200",
      result: response.data,
    })

  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  if (_error === "NEED_PHONENO") {
    _response.error.notFound(_error, "폰번호를 입력하세요.");
    return;
  }
  if (_error === "TEXT_MESSAGE") {
    _response.error.notFound(_error, "메시지를 입력하세요.");
    return;
  }


  _response.error.unknown(_error.toString());
  next(_error);
}

