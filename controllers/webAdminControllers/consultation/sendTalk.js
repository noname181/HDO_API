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

/**
 * 알림톡 함수
 * notificationTemplate.js 와 같이 사용
 * userId 필요
 * ****system에서 보내는건 phoneCaller
 * @param {string} userId
 * @param {object} tempData
 * @param {string} phoneNo
 * @param {string} phoneCaller
 * @param {string} chargerId
 */
const sendTalk = async (tempData, phoneNo, userId, phoneCaller, chargerId) => {
  if (!userId) {
    throw new Error('userId는 비어있으면 안 됩니다.');
  }

  if (!phoneNo || typeof phoneNo !== 'string') {
    throw new Error('phoneNo는 문자열이어야 하며, 비어있으면 안 됩니다.');
  }

  if (!tempData) {
    throw new Error('notificationTemplate.js의 리턴 확인');
  } else if (!tempData.templateCode) {
    throw new Error('notificationTemplate.js의 templateCode 확인');
  } else if (!tempData.message) {
    throw new Error('notificationTemplate.js의 message 확인');
  }

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

  const url = 'https://wt-api.carrym.com:8443/v3/A/hdhyundaioilbank2/messages';
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
      senderKey: process.env.ALIM_SENDKEY,
    },
  ];
  data[0].phoneNum = phoneNo.toString().trim();
  data[0].templateCode = tempData.templateCode.toString().trim();
  data[0].message = tempData.message.toString().trim();
  // data[0].title = title;
  if (tempData.button) {
    data[0].button = tempData.button;
  }

  data[0].smsSndNum = process.env.SMS_NUM;
  data[0].smsKind = 'L';
  data[0].lmsMessage = tempData.message.toString().trim();

  const rsp = await axios.post(url, data, { headers });
  console.log(rsp);

  try {
    console.log(`Talk SEND response.data => ${JSON.stringify(rsp.data)}`);
    const sms_cd = rsp.data[0].code;
    console.log(sms_cd);
    if (sms_cd === 'AS') {
      await createMessageLogsFunc(
        userId,
        chargerId,
        tempData.message,
        phoneNo,
        parseTimestamp(rsp.data[0].altSndDtm),
        'S',
        'TALK'
      );
    } else if (sms_cd === 'EW' || sms_cd === 'SS') {
      await createMessageLogsFunc(
        userId,
        chargerId,
        tempData.message,
        phoneNo,
        parseTimestamp(rsp.data[0].altSndDtm),
        'S',
        'MESSAGE',
        phoneCaller
      );
    } else {
      await createMessageLogsFunc(
        userId,
        chargerId,
        tempData.message,
        phoneNo,
        parseTimestamp(rsp.data[0].smsSndDtm),
        'F',
        'TALK',
        phoneCaller
      );
    }
  } catch (error) {
    console.error('sendMessage::service::', error);
  }
};

module.exports = { sendTalk };
