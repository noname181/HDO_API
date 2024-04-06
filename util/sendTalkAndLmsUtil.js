const axios = require('axios');
const net = require('net');
const { createMessageLogsFunc } = require('../controllers/webAdminControllers/consultation/createMessageLogsFunc');
const { parseTimestamp } = require('./parseTimestampToDateTime');
const { getFormatDate, getKoreanDate } = require('../util/common-util');
const models = require('../models');

/**
 * Send Talk and LMS messages.
 *
 * @param {string} phoneNo - The phone number to which the message will be sent.
 * @param {string} text_message - The text message to be sent.
 * @param {string|null} [templateCode=null] - The template code (optional).
 * @param {number|null} [chg_id=null] - The change ID (optional).
 * @returns {Promise<void>} - A Promise that resolves when the message is sent successfully.
 * @throws {Error} - Throws an error if the message sending fails.
 */
const sendTalkAndLms = async (phoneNo, text_message, templateCode = null, chg_id = null) => {
  let url = 'https://wt-api.carrym.com:8443/v3/L/hdhyundaioilbank2/messages';
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(date.getFullYear());
  // 템플릿코드가 유효하지 않으면 LMS만 발송
  const sendData = {
    custMsgSn: `SOME_UNIQUE_KEY_${year}${month}${day}_${Math.floor(Math.random() * 9999990) + 10}`,
    phoneNum: phoneNo,
    smsSndNum: process.env.SMS_NUM || process.env.CS_CALL_NUM || '15515129',
    message: text_message,
    subject: 'EVnU',
  };
  // EV_BB_03, EV_BA_03, EV_BA_04, EV_BA_05
  // 템플릿이 승인이 안나면, LMS도 안나가는 현상 발견. 임시 방편으로 검수중인 템플릿코드들을 걸러냄.(2023.12.20)
  // const tempExceptArr = ["EV_BB_03", "EV_BA_03", "EV_BA_04", "EV_BA_05"]
  // if (templateCode && !tempExceptArr.includes(templateCode)) {
  if (templateCode) {
    // 템플릿코드가 유효하다면 TALK => 실패시 LMS 발송(2lv) 방식
    url = 'https://wt-api.carrym.com:8443/v3/A/hdhyundaioilbank2/messages';
    sendData['senderKey'] = process.env.ALIM_SENDKEY || 'f8bb45a3c22d83570e5982cdf0a258a9494aebde'; // 필수
    sendData['templateCode'] = templateCode; // 필수
    sendData['msgType'] = 'AT'; // AT : 알림톡텍스트, AI : 알림톡 이미지
    sendData['smsKind'] = 'L'; // 알림톡 발송실패시 우회문자 종류 S: SMS발송, L: LMS발송, 그외 : 발송안함
    // sendData["smsMessage"] = text_message // smsKind S일때 필수 사용
    // sendData["lmsMessage"] = text_message // smsKind L일때 사용. 생략시 message 필드 데이터가 전송됨.
    // sendData["title"] = '현대오일뱅크' // 알림톡 강조표기 메시지, 제목
    // sendData["subject"] = '현대오일뱅크' // 알림톡 발송실패 건 LMS 전환발송 시 LMS 제목
    // 기타 옵션 : button, quickReply, header, itemHighlight, item : 문서참조
    if (templateCode === 'EV_AA_012') {
      // 버튼형(채널추가) 알림톡은 현재 회원가입 하나뿐임. 추후 모듈화할 필요성 있을시 리팩토링 할 것
      sendData['button'] = [
        {
          name: '채널 추가',
          type: 'AC',
        },
      ];
    }
  }

  const data = [sendData];

  const headers = {
    'Content-Type': 'application/json',
    charset: 'utf-8',
    Authorization: `Bearer ${process.env.KAKAO_CLIENT_KEY}`,
  };

  const response = await axios.post(url, data, { headers, timeout: 8000 });
  const resData = response?.data[0];
  const resCode = resData?.code;
  // resCode === 'EW' || res_cd === 'SS'
  console.log('!!! response?.data', response?.data[0]);
  console.log('!!! resData(response?.data?.response)', resData);
  console.log('!!! resCode', resCode);
  if (resCode === 'AS') {
    console.log('Talk SUCCESS');
    await models.MessageLog.create({
      csId: null,
      chargerId: chg_id,
      textMessage: text_message,
      phoneNo: phoneNo,
      messageType: 'TALK',
      sendDt: parseTimestamp(resData?.altSndDtm ? resData?.altSndDtm?.toString() : null),
      phoneCaller: process?.env?.SMS_NUM,
      returnType: 'S',
    });
  } else if (resCode === 'SS' || resCode === 'EW') {
    console.log('LMS SUCCESS');
    let sendDt;
    if (resData?.reqDtm) {
      sendDt = resData?.reqDtm?.toString();
    } else if (resData?.altSndDtm) {
      sendDt = resData?.altSndDtm?.toString();
    } else {
      sendDt = null;
    }
    await models.MessageLog.create({
      csId: null,
      chargerId: chg_id,
      textMessage: text_message,
      phoneNo: phoneNo,
      messageType: 'MESSAGE',
      sendDt: parseTimestamp(sendDt),
      phoneCaller: process?.env?.SMS_NUM,
      returnType: 'S',
    });
  } else {
    let sendDt;
    if (resData?.reqDtm) {
      sendDt = resData?.reqDtm?.toString();
    } else if (resData?.altSndDtm) {
      sendDt = resData?.altSndDtm?.toString();
    } else {
      sendDt = null;
    }
    await models.MessageLog.create({
      csId: null,
      chargerId: chg_id,
      textMessage: text_message,
      phoneNo: phoneNo,
      messageType: 'MESSAGE',
      phoneCaller: process?.env?.SMS_NUM,
      sendDt: parseTimestamp(sendDt),
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

module.exports = { sendTalkAndLms };
