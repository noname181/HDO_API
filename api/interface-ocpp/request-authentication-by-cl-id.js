/**
 * Created by Jackie Yoon on 2023-08-07.
 * 사용자 인증 및 결제 검토
 * 회원 인증, 할인조건, 결제 수단 검증
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");

module.exports = {
  path: ["/request-authentication/:clId"],
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
    // 회원 인증, 할인조건, 결제 수단 검증
    // 검증 성공 하면  OK / 희망충전량 등을 리턴
    await models.sequelize.query(
      `CALL Proc_11_Request_Authentication(${cl_id}, @userId, @sendPush, @Desired_kwh, @AppliedUnitPrice, @rtnCd, @rtnMsg)`
    );
    const queryResult = await models.sequelize.query(
      `SELECT @userId AS userId, @sendPush AS sendPush, @Desired_kwh AS desiredKwh, @AppliedUnitPrice as appliedUnitPrice, @rtnCd as rtnCd, @rtnMsg as rtnMsg;`,
      { type: sequelize.QueryTypes.SELECT }
    );

    _response.json(queryResult[0]);
  } catch (e) {
    _response.json({
      rtnMsg: e.toString(),
    });
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
