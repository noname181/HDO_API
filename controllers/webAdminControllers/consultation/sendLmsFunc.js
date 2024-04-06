const axios = require('axios');
const net = require('net');
const { createMessageLogsFunc } = require('./createMessageLogsFunc');
const { parseTimestamp } = require('../../../util/parseTimestampToDateTime');

const sendLmsFunc = async (userId, phoneNo, text_message, subject) => {
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

  if (!subject?.toString().trim()) {
    subject = 'EVnU';
  }

  try {
    const isFirewallOpen = await testConnection;
    if (isFirewallOpen) {
      console.log('방화벽 확인: 뚫려 있음');
    }
  } catch (err) {
    console.log('방화벽 확인: 막힘');
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

  const rsp = await axios.post(url, data, { headers });
  try {
    const sms_cd = rsp.data[0].code;
    if (sms_cd === 'EW' || sms_cd === 'SS') {
      await createMessageLogsFunc(
        userId,
        null,
        text_message,
        phoneNo,
        parseTimestamp(rsp.data[0].reqDtm ? rsp.data[0].reqDtm.toString() : null),
        'S',
        'MESSAGE',
        '15515129'
      );
      console.log('LMS SUCCESS');
    } else {
      await createMessageLogsFunc(
        userId,
        null,
        text_message,
        phoneNo,
        parseTimestamp(rsp.data[0].reqDtm ? rsp.data[0].reqDtm.toString() : null),
        'F',
        'MESSAGE',
        '15515129'
      );
    }
    return { rsp, sms_cd };
  } catch (error) {
    console.error('Error when processing the response:', error);
  }
};

module.exports = { sendLmsFunc };
