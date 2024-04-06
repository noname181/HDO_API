/**
 * Created by hdc on 2023-10-12.
 * 환불 or 부분취소 결제 테스트 모듈
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const axios = require('axios');
const crypto = require('crypto');
const moment = require("moment");
// const notification = require('../../middleware/send-notification');
const { refundALLRequestFromKICC } = require("../../util/paymentUtil")

module.exports = {
  path: ['/test-refund-all-payment'],
  method: 'post',
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    // 승인번호
    const pgCno = _request.body?.pgCno;

    // const requestInput = {
    //   request_type : 'REFUND',
    //   pgCno : pgCno,
    //   chg_id : 4,
    //   conn_id : 1,
    //   card_id : null,
    //   request_kwh : 2,
    //   request_percent : 0,
    //   request_amt : 0,
    //   actual_calculated_amt : refundAmount,
    //   dummy_pay_amt : refundAmount,
    //   createdWho : null,
    //   updatedWho : null,
    //   userId : null
    // }
    // const sb_charge_request = await models.sb_charge_request.create(requestInput)

    let isRefundRequestSuccess = false;
    const originPayNotification = await models.PaymentNotification.findOne({
      where: {
        cno: pgCno,
        noti_type: '10'
      },
      order: [
        ['id', 'DESC']
      ],
      limit: 1,
    })
    const refundResult = await refundALLRequestFromKICC(pgCno, originPayNotification?.memb_id);
    console.log("!! 전체취소결제 결과 !!", refundResult)
    if (refundResult?.resCd === "0000") {
      // 결제 성공
      isRefundRequestSuccess = true;
    }
    if (isRefundRequestSuccess) {
      // TODO 부분취소 성공 시 2lvl 알림 전송
      _response.json({result: refundResult});
      return;
    } else {
      _response.json({result: refundResult});
      return;
    }
    console.log(" !!! 리턴이 안되고 여기까지 들어오는지. !!!")

  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_AUTH_NUM') {
    _response.error.badRequest(_error, '신용카드 결제 승인 번호가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
