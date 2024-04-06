/**
 * Created by Jackie Yoon on 2023-08-09.
 * 충전 및 주차료 결제 API
 * 회원 할인 조건, 무료 충전량, 추가 결제 필요사항을 계산하여 추가 결제 진행
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const axios = require("axios");
// const notification = require('../../middleware/send-notification');

module.exports = {
  path: ["/request-payment/:clId"],
  method: "post",
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const cl_id = _request.params.clId;

  try {
    // 결제 금액 계산 요청
    await models.sequelize.query(
      `CALL Proc_12_Requst_Payment(${cl_id}, @orgCategory, @orgId, @userId, @totalPrice, @ChargeFee, @ParkFee, @paymentLogID, @KBillingeys, @PayMethodIds)`
    );
    const queryResult = await models.sequelize.query(
      `SELECT @orgCategory AS orgCategory, @orgId AS orgId, @userId AS userId, @totalPrice AS totalPrice, @ChargeFee AS chargeFee, @ParkFee AS parkFee, @paymentLogID AS paymentLogID, @KBillingeys AS KBillingeys, @PayMethodIds AS PayMethodIds;`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // totalPrice만큼 결제 진행
    if (queryResult[0] && queryResult[0].totalPrice) {
      const totalPrice = queryResult[0].totalPrice;
      const kBillingKeys = queryResult[0].KBillingeys.split(",");

      if (totalPrice > 0 && kBillingKeys && kBillingKeys.length > 0) {
        // 실패 시 다른 빌링키로 결제 진행
        let isPayRequestSuccess = false;
        const reversedKBillingKeys = kBillingKeys.reverse();
        for (let i = 0; i < reversedKBillingKeys.length; i++) {
          const paymentResult = await payRequestFromKICC(totalPrice, reversedKBillingKeys[i]);
          if (paymentResult === "0000") {
            // 결제 성공
            isPayRequestSuccess = true;
            break;
          }
        }

        if (!isPayRequestSuccess) {
          // 결제 실패 시 미수기록 작성
          // TODO 결제 실패 시 3lvl 알림 전송
          await models.sequelize.query(
            `CALL Proc_14_Restrict_Unpaid('${queryResult[0].orgCategory}', ${queryResult[0].orgId}, '${queryResult[0].userId}', ${queryResult[0].totalPrice}, ${queryResult[0].chargeFee}, ${queryResult[0].parkFee}, ${queryResult[0].paymentLogID})`
          );
          _response.json({
            status: "200",
            message: "결제에 실패하여 미수기록을 작성하였습니다.",
          });
          return;
        } else {
          // TODO 결제 성공 시 3lvl 알림 전송
          _response.json({
            status: "200",
            message: "결제에 성공하였습니다.",
          });
        }
        return;
      } else {
        _response.json({
          status: "200",
          message: "결제 금액이 0원이므로 결제 요청을 하지 않았습니다.",
        });
        return;
      }
    }
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}

// KICC 결제 요청 함수
async function payRequestFromKICC(totalPrice, kBillingKey) {
  try {
    const transactionID = createTransactionID(new Date());
    const shopOrderNo = "order-" + transactionID;
    const payResponse = await axios({
      url: process.env.KICC_REQ_BILLING_PAY || "https://pgapi.easypay.co.kr/api/trades/approval/batch",
      method: "POST",
      data: {
        mallId: process.env.EASYPAY_MALL_ID || "05574880",
        shopTransactionId: transactionID,
        shopOrderNo: shopOrderNo,
        amount: totalPrice,
        approvalReqDate: formatDate(new Date()),
        payMethodInfo: {
          billKeyMethodInfo: {
            batchKey: kBillingKey,
          },
        },
        orderInfo: {
          goodsName: "차량 충전",
        },
      },
    });
    return payResponse.data.resCd;
  } catch (e) {
    return "AXIOS_ERROR";
  }
}

// 고유한 트랜잭션 ID의 생성을 보장하는 함수
// example: pay-230809-tr-1691549501716
function createTransactionID(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = String(date.getFullYear()).slice(2);
  const postfix = String(date.getTime());
  return `pay-${year}${month}${day}-tr-${postfix}`;
}

// 결제 승인날짜 생성 함수
// example: 20230809
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}
