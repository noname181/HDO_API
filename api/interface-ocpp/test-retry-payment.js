"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const axios = require("axios");
// const notification = require('../../middleware/send-notification');
const { payRequestFromKICC, refundRequestFromKICC, createTransactionID, formatDate, getMsgAuthValue } = require("../../util/paymentUtil")
const moment = require("moment");

module.exports = {
  path: ["/test-retry-payment"],
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

    // const sb_charge_request = await models.sb_charge_request.create(requestInput)
    let isPayRequestSuccess = false;
    const paymentResult = await payRequestFromKICC(totalPrice, billingKey, mallId ?? null, true);
    console.log("!! 재결제 결과 !!", paymentResult)
    if (paymentResult?.resCd === "0000") {
      // 결제 성공
      isPayRequestSuccess = true;
    }
    if (!isPayRequestSuccess) {
      _response.json({paymentResult});
    } else {
      _response.json({paymentResult});
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

