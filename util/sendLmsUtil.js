const axios = require('axios');
const net = require('net');
const { createMessageLogsFunc } = require('../controllers/webAdminControllers/consultation/createMessageLogsFunc');
const { parseTimestamp } = require('./parseTimestampToDateTime');
const { getFormatDate, getKoreanDate } = require('../util/common-util');
const models = require('../models');

const sendLms = async (phoneNo, text_message, chg_id = null) => {
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
      smsSndNum: process.env.SMS_NUM || process.env.CS_CALL_NUM || '15515129',
      senderKey: 'hdhyundaioilbank2',
      message: text_message,
    },
  ];

  const response = await axios.post(url, data, { headers, timeout: 8000 });
  const sms_cd = response.data[0].code;
  if (sms_cd === 'EW' || sms_cd === 'SS') {
    console.log('LMS SUCCESS');
    const cur_kor_date = getFormatDate(getKoreanDate());
    await models.MessageLog.create({
      csId: null,
      chargerId: chg_id,
      textMessage: text_message,
      phoneNo: phoneNo,
      sendDt: parseTimestamp(response.data[0].reqDtm ? response.data[0].reqDtm.toString() : null),
      returnType: 'S',
    });
  } else {
    await models.MessageLog.create({
      csId: null,
      chargerId: chg_id,
      textMessage: text_message,
      phoneNo: phoneNo,
      sendDt: parseTimestamp(response.data[0].reqDtm ? response.data[0].reqDtm.toString() : null),
      returnType: 'F',
    });
  }
  return response;
  // const sms_cd = rsp.data[0].code;
  // if (sms_cd === 'EW' || sms_cd === 'SS') {
  //   console.log('LMS SUCCESS');
  // } else {
  //   throw new Error('SEND_LMS1_ERROR');
  // }
};

module.exports = { sendLms };
