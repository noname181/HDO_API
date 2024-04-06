const axios = require('axios');
const net = require('net');
const { createMessageLogsFunc } = require('./createMessageLogsFunc');
const { parseTimestamp } = require('../../../util/parseTimestampToDateTime');

const sendTalkFunc = async (userId, phoneNo, text_message) => {
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
  const testMessage = `[EV&U] EV 충전이 완료되었습니다. 
  충전완료 시간 : #{CP_DATE}
  충전 완료 15분 후부터 미출차 수수료가 부과되오니, 다른 고객의 충전을 위하여 차량을 이동해 주십시오.
  
  -HD현대오일뱅크-`;
  const data = [
    {
      custMsgSn: `SOME_UNIQUE_KEY_${year}${month}${day}_${Math.floor(Math.random() * 9999990) + 10}`,
      senderKey: 'f8bb45a3c22d83570e5982cdf0a258a9494aebde',
      phoneNum: phoneNo,
      templateCode: 'EVNU_E005',
      message: testMessage,
    },
  ];

  const rsp = await axios.post(url, data, { headers });
  if (!Array.isArray(rsp.data) || rsp.data.length === 0) {
    throw new Error('Response data is not an array or empty');
  }
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
        'TALK'
      );
      console.log('TALK SUCCESS');
    } else {
      await createMessageLogsFunc(
        userId,
        null,
        text_message,
        phoneNo,
        parseTimestamp(rsp.data[0].reqDtm ? rsp.data[0].reqDtm.toString() : null),
        'F',
        'TALK'
      );
      throw new Error('SEND_TALK_ERROR');
    }
    return { rsp, sms_cd };
  } catch (error) {
    console.error('Error when processing the response:', error);
    throw new Error('SEND_SMS_ERROR');
  }
};

module.exports = { sendTalkFunc };
