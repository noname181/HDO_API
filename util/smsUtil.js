const axios = require('axios');

async function sendSMS(phoneNo, text_message) {
  const url = process.env.SMS_API_URL;
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
      smsSndNum: process.env.CS_CALL_NUM,
      smsMessage: text_message,
    },
  ];
  try {
    const rsp = await axios.post(url, data, { headers });
    console.log(`SMS SEND response.data => ${JSON.stringify(rsp.data)}`);
    const sms_cd = rsp.data[0].code;
    if (sms_cd === 'EW' || sms_cd === 'SS') {
      return 'SUCCESS';
    } else {
      return 'ERROR';
    }
  } catch (error) {
    console.error('sendSMS::error::', error);
    return 'ERROR';
  }
}

module.exports = { sendSMS };
