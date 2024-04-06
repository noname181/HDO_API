/**
 * Created by SeJin Kim on 2023-08-31
 * OCPP -> Request -> BE
 * 현장 신용카드 결제 진행하는 사용자의 휴대폰 번호 업데이트
 * Update the mobile phone number of users who proceed with on-site credit card payments
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const cryptor = require("../../util/cryptor");

module.exports = {
  path: ["/charging-member-phone"],
  method: "post",
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // Request
  // const params = {
  //   chg_id: _request.body.chg_id, // 충전기 인덱스 (int),     Charger ID
  //   phone: _request.body.phone, // 휴대폰 번호 (String),    Phone Number
  // };

  const body = {
    chg_id: _request.body?.chg_id,
    phone: _request.body?.phone,
    connector_id: _request.body?.conn_id ?? 1 // OCPP에서 오지 않으면 기본 채널 1
  }

  try {
    if (!body?.chg_id || !body?.phone) {
      throw "NEED_PARAMETER";
    }
    // 현장결제시 무조건 폰번호 등록이 먼저 날아온다고 한다.
    // 즉 현장결제는 항상 폰번호 등록과 함께 이루어진다.
    // 결제정보를 등록할때, 결제정보연결이 이루어지지 않은 해당 충전기의 해당 커넥터에 대한 정보가 없다면 create, 있으면 update.
    // 번호등록 페이즈에서는 항상 create다.
    await models.sb_charge_local_ic_pay.create(body);

    const result = {
      result: "success"
    };
    _response.json(result);
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  if (_error === "NEED_PARAMETER") {
    _response.error.badRequest(_error, "충전기인덱스나 휴대폰번호가 누락되었습니다.");
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
