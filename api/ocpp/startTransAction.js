/**
 * Created by hdc on 2023-09-18
 * APP -> Request -> BE -> OCPP
 * 앱으로부터 요청받아 OCPP에게 충전시작 요청을 보냄.
 * Request from app and send charge start request to OCPP.
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const cryptor = require("../../util/cryptor");
const remoteStartTransaction = require("../../util/ocpp/remoteStartTransaction");

module.exports = {
  path: ["/ocpp/startTransAction"],
  method: "post",
  checkToken: true,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

//TODO OCPP Business Logic Modify
async function service(_request, _response, next) {
  // Request
  const params = {
    chg_id: _request.body?.chg_id, // 충전기 인덱스 (int),     Charger ID
    usersNewId: _request.body?.usersNewId, // 유저아이디. User Id
    chg_channel: _request.body?.chg_channel, // 충전기 채널. chg_channel
    rfCardNo: _request.body?.rfCardNo, // 멤버쉽번호(rfCardNo) (String),    Member Number
    kwh: _request.body?.kwh, // 총 충전요청량 (int)
    amount: _request.body?.amount, // 총결제금액 (int)
  };

  let result;
  /*
  파라미터
    cid
    vendorId
    connId
    idTag
    kwh
    amount
    unitPrice
  * */

  try {
    result = await remoteStartTransaction(
      params.chg_id,
      '벤더아이디',
      params.chg_channel,
      params.rfCardNo,
      150,
      20000,
      500
    );
    _response.json(result);
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
