'use strict';

const { PaymentNotificationRequest, Convert } = require('../../util/payment-notification-request');
const { Request, Response, NextFunction } = require('express');

const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const axios = require('axios');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer(); // Create a multer instance for handling multipart/form-data
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { EmailService } = require('../../services/emailService/emailService');
const moment = require('moment');
const winston = require('winston');
const winstonMysql = require('winston-mysql');
const { getKoreanDate, getFormatDateToDays } = require('../../util/common-util');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const {Op} = require("sequelize");

const options_default = {
  host: process.env.SQL_HOST || 'localhost',
  user: process.env.SQL_USER || 'hdo-dev',
  password: process.env.SQL_PASSWORD || 'k1:04T8>K7hJ',
  database: process.env.SQL_DATABASE || 'evcore22',
  table: 'sys_logs_defaults',
};

// 로깅 설정
const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [new winstonMysql(options_default)],
});

module.exports = {
  path: ['/payment/result'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

// Middleware for handling application/x-www-form-urlencoded requests
const formParser = bodyParser.urlencoded({ extended: false, limit: '1mb', parameterLimit: 50 });

/**
 * Parses datetime string in format 'yyyyMMddhhmmss' and return Date instance
 * @param {string} input
 */
function parseTimestamp(input) {
  const matches = input.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!matches || matches.length != 7) throw new Error('unexpected timestamp format sent from EasyPay');

  const result = new Date(0);
  result.setFullYear(parseInt(matches[1]));
  result.setMonth(parseInt(matches[2]) - 1);
  result.setDate(parseInt(matches[3]));
  result.setHours(parseInt(matches[4]));
  result.setMinutes(parseInt(matches[5]));
  result.setSeconds(parseInt(matches[6]));

  return result;
}

/**
 * @param {Request} req
 * @param {PaymentNotificationRequest} req.body
 * @param {Response} res
 * @param {NextFunction} next
 */
async function service(req, res, _next) {
  /** @type {PaymentNotificationRequest} */
  const body = req.body;

  // console.log('!!! 노티 Payment result req body', JSON.stringify(body));


//   const body = 
//   { 
//     "amount": 945,
//     "createdAt": "2023-11-20 10:40:40",
//     "res_cd": "5001",
//     "res_msg": "정상승인",
//     "cno": "23112010403973921597",
//     "order_no": "50026502231120104038",
//     "auth_no": "27166947",
//     "tran_date": "20231120104039",
//     "card_no": "940915**********",
//     "issuer_cd": "045",
//     "issuer_nm": "롯데카드",
//     "acquirer_cd": "047",
//     "acquirer_nm": "롯데카드사",
//     "noint": "00",
//     "install_period": 0,
//     "used_pnt": null,
//     "escrow_yn": "N",
//     "complex_yn": null,
//     "stat_cd": null,
//     "stat_msg": null,
//     "van_tid": "7338171",
//     "van_sno": "201063921597",
//     "pay_type": "11",
//     "memb_id": "05576579",
//     "noti_type": "10",
//     "part_cancel_yn": null,
//     "memb_gubun": null,
//     "card_gubun": null,
//     "card_biz_gubun": null,
//     "cpon_flag": null,
//     "cardno_hash": null,
//     "sub_card_cd": null,
//     "bk_pay_yn": null,
//     "remain_pnt": null,
//     "accrue_pnt": null,
//     "canc_date": null,
//     "mgr_amt": null,
//     "mgr_card_amt": null,
//     "mgr_cpon_amt": null,
//     "mgr_seqno": null,
//     "mgr_req_msg": null,
//     "day_rem_pnt": null,
//     "month_rem_pnt": null,
//     "day_rem_cnt": null,
//     "cl_id": 236,
//     "chg_id": 516,
//     "connector_id": 1,
//     "phone": "01086391580",
//     "applied_unit_price": 315,
//     "desired_kwh": 3
// };

  // 만약 isRetry = "Y"이면서 clId가 존재한다면 해당 충전로그를 기반으로 정보를 업데이트 해줌.
  if(body?.reserve1 === "Y" && body?.reserve2) {
    const clog = await models.sb_charging_log.findByPk(parseInt(body?.reserve2))
    if (clog) {
      body["cl_id"] = clog?.cl_id
      body["chg_id"] = clog?.chg_id
      body["connector_id"] = clog?.cl_channel
      body["phone"] = clog?.receivePhoneNo
      body["applied_unit_price"] = clog?.appliedUnitPrice
      body["desired_kwh"] = clog?.desired_kwh
      // 미결제건이라 pg_cno가 들어가지 않았을텐데, 여기서 업데이트해줌.
      // 기존에 들어가 있던 주문번호, 승인번호는 일단 지우지 않음. 20240125
      clog.pg_cno = body?.cno
      await clog.save()
    }
  }

  console.log("노티 body", body)
  const now = getKoreanDate();
  const notification = buildNotificationModel(body);
  notification.createdAt = now;

  // await models.temp_easy_log.create({
  //   content: "stringify : " + JSON.stringify(body)
  // })
  //
  // await models.temp_easy_log.create({
  //   content: "notification stringify: " + JSON.stringify(notification)
  // })

  if (body.res_cd !== '0000') {
    // It is supposed not to happen, EasyPay does not send notification if payment failed
    // TODO replace console.log
    // console.log('EasyPay sent notification with unexpected response code: ', body.res_cd); 
    await models.PaymentFailLog.create({...notification, json_response: body});
    res.status(400).send('res_cd=5001^res_msg=FAIL');
    return;
  }

  // let transaction = null;
  // let shouldRollback = true;
  try {
    // transaction = await models.sequelize.transaction();

    // let check_code = [];
    // if (res_cd == '0000' && noti_type == '10' && pay_type == '11') {
    //   check_code.push(1);
    //   const refundResult = await refundRequestFromKICC(amount.toString(), cno);
    //   if (refundResult === '0000') {
    //     check_code.push(2);
    //     paymentLog.payStatus = 'PAID';
    //     resultMsg = `res_cd=0000${String.fromCharCode(31)}res_msg=SUCCESS`;
    //   } else {
    //     check_code.push(3);
    //     paymentLog.payStatus = 'UNPAID';
    //     resultMsg = `res_cd=5001${String.fromCharCode(31)}res_msg=FAIL`;
    //   }
    // } else {
    //   check_code.push(4);
    //   paymentLog.payStatus = 'UNPAID';
    //   resultMsg = `res_cd=5001${String.fromCharCode(31)}res_msg=FAIL`;
    // }

    // 만약 원본 결제라면 하나의 cno 기준으로만 들어가도록 한다.
    if (notification?.noti_type == '10') {
      const isExistOriginalNoti = await models.PaymentNotification.findOne({
        where: { cno: notification?.cno, noti_type: '10' },
      });
      // console.log(`isExistOriginalNoti - ${notification?.cno}`, isExistOriginalNoti);
      if (!isExistOriginalNoti) {
        const notificationModel = await models.PaymentNotification.create(notification);
        // 이부분이 원본결제가 새로 들어가는 부분.
        // 이때 만약 이 노티의 주문번호와 승인번호와 같은 값을 가진 현장결제정보가 있다면, 거래번호를 그쪽에 넣어준다.
        // 현장결제정보가 거래번호를 가지고 있다면, 노티가 들어왔고, 노티와 연결이 되었다는 플래그로 인식이 가능하다.

        // 11.30 clog를 찾을 수 있다면, clog가 가진 기초정보를 이용해 노티에 입혀준다.
        // 후불결제는 반드시 이 로직에 걸린다.
        const clog = await models.sb_charging_log.findOne({
          where: {
            order_no: notificationModel?.order_no,
            approval_number: notificationModel?.auth_no,
          },
          order: [['cl_id', 'desc']]
        })
        if (clog) {
          // 원결제 정보가 도착할때, 충전로그가 이미 존재하는 경우
          // 재결제는 애초에 clog를 못찾아서 이걸 안탐. 2023.12.24
          notificationModel.cl_id = clog?.cl_id
          notificationModel.chg_id = clog?.chg_id
          notificationModel.connector_id = clog?.cl_channel
          notificationModel.phone = clog?.receivePhoneNo
          notificationModel.applied_unit_price = clog?.appliedUnitPrice
          notificationModel.desired_kwh = clog?.desired_kwh
          notificationModel.card_no = clog?.payMethodDetail
          await notificationModel.save()
        } else {
          // 원결제 정보가 도착할때, 충전로그가 존재 하지 않는 경우
          // 재결제가 아닐떄만 이 작업을 해야함. 2023.12.24
          if (notificationModel?.isRetry && notificationModel?.isRetry !== "Y") {
            const targetIcPayRow = await models.sb_charge_local_ic_pay.findOne({
              where: {
                ordernumber: notificationModel?.order_no,
                approvalnumber: notificationModel?.auth_no,
                pg_cno : null,
              },
              order: [['id', 'desc']],
            })
            if (targetIcPayRow) {
              targetIcPayRow.pg_cno = notificationModel?.cno
              targetIcPayRow.mall_id = notificationModel?.memb_id
              await targetIcPayRow.save()
              notificationModel.chg_id = targetIcPayRow?.chg_id
              notificationModel.connector_id = targetIcPayRow?.connector_id
              notificationModel.phone = targetIcPayRow?.phone
              notificationModel.card_no = targetIcPayRow?.cardkey
              notificationModel.applied_unit_price = targetIcPayRow?.applied_unit_price
              notificationModel.desired_kwh = targetIcPayRow?.desired_kwh
              await notificationModel.save()
            }
          }
        }
      }
    } else if (notification?.noti_type == '20') {
      // mgr_seqno로 중복투입을 막는다.
      const isExistOriginalCancelNoti = await models.PaymentNotification.findOne({
        where: { mgr_seqno: notification?.mgr_seqno },
      });
      // console.log(`isExistOriginalCancelNoti - ${notification?.mgr_seqno}`, isExistOriginalCancelNoti);
      if (!isExistOriginalCancelNoti) {
        // 원본결제가 있다면 원본결제의 값을 토대로 부가정보들을 넣어준다.
        const cancelNoti = await models.PaymentNotification.create(notification);
        const originalNoti = await models.PaymentNotification.findOne({
          where: { noti_type: '10', cno: cancelNoti?.cno}
        })
        if (originalNoti && cancelNoti) {
          cancelNoti.chg_id = originalNoti?.chg_id
          cancelNoti.connector_id = originalNoti?.connector_id
          cancelNoti.phone = originalNoti?.phone
          cancelNoti.card_no = originalNoti?.card_no
          cancelNoti.applied_unit_price = originalNoti?.applied_unit_price
          cancelNoti.desired_kwh = originalNoti?.desired_kwh
          await cancelNoti.save()
        }
      }
    } else {
      const notificationModel = await models.PaymentNotification.create(notification);
    }
    // console.log('notification', notification);
    // 일별 몰아이디별 집계 데이터 결산
    let amt = 0;
    if (notification?.noti_type == '10') {
      amt = notification?.amount;
    } else if (notification?.noti_type == '20' && notification?.mgr_amt) {
      amt = notification?.mgr_amt * -1;
    }
    const dateString = getFormatDateToDays(getKoreanDate());

    const upsertQuery = await models.sequelize.query(
      `
          INSERT INTO sb_daily_amount(mall_id, calculate_date, amount)
          VALUES(:mall_id, :dateString, :amount)
          ON DUPLICATE KEY UPDATE amount = amount + :amount
        `,
      {
        replacements: {
          mall_id: notification?.memb_id,
          dateString: dateString,
          amount: amt,
        },
        type: sequelize.QueryTypes.UPSERT,
        raw: true,
      }
    );

    // await transaction.commit();
    // shouldRollback = false;
    res.status(200).send('res_cd=0000^res_msg=SUCCESS');
  } catch (error) {
    // TODO replace console.log
    logger.error(error.toString());
    console.log('failed to process payment result notification');
    console.log(error);
    res.status(500).send('res_cd=5001^res_msg=FAIL');
  } finally {
    // if (transaction && shouldRollback) await transaction.rollback();
  }
}

/*

정상승인 빌링키기반 결제시 JSON 형태
{
    "resCd": "0000",
    "resMsg": "단독승인 정상",
    "mallId": "05574880",
    "pgCno": "23110811420910846419",
    "shopTransactionId": "refund-231108-tr-1699411332197",
    "shopOrderNo": "order-refund-231108-tr-1699411332197",
    "amount": 200,
    "transactionDate": "20231108114209",
    "statusCode": "TS03",
    "statusMessage": "매입요청",
    "msgAuthValue": "956058e94068075e04713db8d96cb941d5645979fbe61de76f7ebd6fbb892410",
    "escrowUsed": "N",
    "paymentInfo": {
        "payMethodTypeCode": "11",
        "approvalNo": "62361024",
        "approvalDate": "20231108114209",
        "cardInfo": {
            "cardNo": "41918700****383*",
            "issuerCode": "026",
            "issuerName": "하나비씨카드",
            "acquirerCode": "026",
            "acquirerName": "비씨카드사",
            "installmentMonth": 0,
            "freeInstallmentTypeCode": "00",
            "cardGubun": "N",
            "cardBizGubun": "P",
            "partCancelUsed": "Y",
            "subCardCd": "526",
            "cardMaskNo": "",
            "vanSno": "081122788183",
            "couponAmount": 0
        },
        "cpCode": "",
        "multiCardAmount": "",
        "multiPntAmount": "",
        "multiCponAmount": "",
        "bankInfo": {
            "bankCode": "",
            "bankName": ""
        },
        "virtualAccountInfo": {
            "bankCode": "",
            "bankName": "",
            "accountNo": "",
            "depositName": "",
            "expiryDate": ""
        },
        "mobInfo": {
            "authId": "",
            "billId": "",
            "mobileNo": "",
            "mobileAnsimUsed": "",
            "mobileCd": ""
        },
        "prepaidInfo": {
            "billId": "",
            "remainAmount": 0
        },
        "cashReceiptInfo": {
            "resCd": "",
            "resMsg": "",
            "approvalNo": "",
            "approvalDate": ""
        },
        "basketInfoList": []
    }
}


부분취소시 JSON 형태
{
    "resCd": "0000",
    "resMsg": "정상처리",
    "mallId": "05574880",
    "shopTransactionId": "refund-231108-tr-1699410722599",
    "shopOrderNo": "order-refund-231108-tr-1699410200113",
    "oriPgCno": "23110811231710805288",
    "cancelPgCno": "23110811320010824029",
    "transactionDate": "20231108113200",
    "cancelAmount": 200,
    "remainAmount": 0,
    "statusCode": "TS06",
    "statusMessage": "부분매입취소",
    "escrowUsed": "N",
    "reviseInfo": {
        "payMethodTypeCode": "11",
        "approvalNo": "",
        "approvalDate": "20231108113200",
        "cardInfo": {
            "couponAmount": 0
        },
        "refundInfo": {
            "refundDate": "",
            "depositPgCno": ""
        },
        "cashReceiptInfo": {
            "resCd": "",
            "resMsg": "",
            "approvalNo": "",
            "cancelDate": ""
        }
    }
}

전체취소시 JSON 형태
{
    "resCd": "0000",
    "resMsg": "정상취소",
    "mallId": "05574880",
    "shopTransactionId": "refund-231108-tr-1699411243187",
    "shopOrderNo": "order-refund-231108-tr-1699411001991",
    "oriPgCno": "23110811363910834569",
    "cancelPgCno": "23110811404010843120",
    "transactionDate": "20231108114040",
    "cancelAmount": 400,
    "remainAmount": 0,
    "statusCode": "TS02",
    "statusMessage": "승인취소",
    "escrowUsed": "N",
    "reviseInfo": {
        "payMethodTypeCode": "11",
        "approvalNo": "",
        "approvalDate": "20231108114040",
        "cardInfo": {
            "couponAmount": 0
        },
        "refundInfo": {
            "refundDate": "",
            "depositPgCno": ""
        },
        "cashReceiptInfo": {
            "resCd": "",
            "resMsg": "",
            "approvalNo": "",
            "cancelDate": ""
        }
    }
}

*/

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  _response.error.unknown(_error.toString());
  next(_error);
}

function buildNotificationModel(body) {
  const result = {
    ...body,
  };

  // required parsible fields
  if (result.amount) result.amount = parseInt(result.amount);
  if (result.tran_date) result.tran_date = parseTimestamp(result.tran_date);

  // optional parsible fields
  if (result.install_period) result.install_period = parseInt(result.install_period);
  if (result.used_pnt) result.used_pnt = parseInt(result.used_pnt);
  if (result.remain_pnt) result.remain_pnt = parseInt(result.remain_pnt);
  if (result.accrue_pnt) result.accrue_pnt = parseInt(result.accrue_pnt);
  if (result.canc_date) result.canc_date = parseTimestamp(result.canc_date);
  if (result.mgr_amt) result.mgr_amt = parseInt(result.mgr_amt);
  if (result.mgr_card_amt) result.mgr_card_amt = parseInt(result.mgr_card_amt);
  if (result.mgr_cpon_amt) result.mgr_cpon_amt = parseInt(result.mgr_cpon_amt);
  if (result.day_rem_pnt) result.day_rem_pnt = parseInt(result.day_rem_pnt);
  if (result.month_rem_pnt) result.month_rem_pnt = parseInt(result.month_rem_pnt);
  if (result.reserve1) result.isRetry = result.reserve1

  return result;
}
