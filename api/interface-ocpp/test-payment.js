/**
 * Created by hdc on 2023-10-12.
 * 임의의 금액 결제요청 API
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const axios = require("axios");
// const notification = require('../../middleware/send-notification');
const { payRequestFromKICC, refundRequestFromKICC, createTransactionID, formatDate, getMsgAuthValue } = require("../../util/paymentUtil")
const moment = require("moment");

module.exports = {
  path: ["/test-payment"],
  method: "post",
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const { totalPrice, billingKey } = _request.body
    const mallId = _request.body?.mallId
    // 빌링키로 카드번호 만들기
    // const card = await models.BankCard.findOne({
    //   where: { billingKey: billingKey },
    // });
    // const userId = card?.userId
    // const cardId = card?.id
    // const requestInput = {
    //   request_type : 'PAYMENT',
    //   chg_id : 4,
    //   conn_id : 1,
    //   card_id : cardId,
    //   request_kwh : 2,
    //   request_percent : 0,
    //   request_amt : 0,
    //   actual_calculated_amt : totalPrice,
    //   dummy_pay_amt : totalPrice,
    //   createdWho : userId,
    //   updatedWho : userId,
    //   userId : userId
    // }

    // const sb_charge_request = await models.sb_charge_request.create(requestInput)
    let isPayRequestSuccess = false;
    const paymentResult = await payRequestFromKICC(totalPrice, billingKey, mallId ?? null);
    console.log("!! 후불결제 결과 !!", paymentResult)
    if (paymentResult?.resCd === "0000") {
      // 결제 성공
      isPayRequestSuccess = true;
    }
    if (!isPayRequestSuccess) {
      // 결제 실패 시 미수기록 작성
      // TODO 결제 실패 시 3lvl 알림 전송
      _response.json({paymentResult});
      return;
    } else {
      // TODO 결제 성공 시 3lvl 알림 전송
      _response.json({paymentResult});
      return
    }
    console.log("리턴이 안되고 여기까지 들어오는지(앱결제)")
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

