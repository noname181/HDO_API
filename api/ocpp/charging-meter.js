/**
 * Created by hdc on 2023-09-19
 * OCPP -> Request -> BE
 * 차징미터 정보 푸시
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");

module.exports = {
  path: ["/charging-meter"],
  method: "post",
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // Request
  const params = {
    chg_id: _request.body.chg_id, // 충전기 인덱스 (int), Charger ID
    transId: _request.body.transId, // 트랜잭션 아이디, TransAction ID
    meter: _request.body.meter, // 그 충전기의 전력량계 미터값
    soc: _request.body.soc, // 배터리 잔량, remain battery
  };

  // Example
  // {
  //   "chg_id" : 2,
  //   "transId" : 124134134,
  //   "meter" : 215,
  //   "soc" : 43
  // }

  try {
    // 충전기 현장결제 정보 등록(sb_charge_local_ic_pay create)

    let res = {}
    let result = "success";
    let msg = "";

    // connection테이블에는 트랜잭션 아이디가 없다
    // sb_charging_logs 이거 가지고 다 해야함. 걍 컬럼 몇개 추가해서 이거 쓰자.

    const updateResult = await models.sequelize.query(
      `UPDATE
              sb_charging_logs
              SET
              cl_kwh = :meter - cl_start_meter,
              soc = :soc
              WHERE chg_id = :chg_id
              AND cl_transaction_id = :transId
              AND cl_stop_meter IS null
           `,
      {
        replacements: { meter: params?.meter, soc: params?.soc, chg_id: params?.chg_id, transId: params?.transId },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res = {
      "result": "success",
      "msg": `총 ${updateResult}행 업데이트에 성공하였습니다.`,
      "resultCnt": updateResult
    }
    _response.json(res);
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