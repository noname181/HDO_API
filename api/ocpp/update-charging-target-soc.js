/**
 * Created by SeJin Kim on 2023-08-31
 * OCPP -> Request -> BE
 * 충전중인 목표 SoC 보고
 * Report the target SoC being charged
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");

module.exports = {
  path: ["/charging-target-soc"],
  method: "post",
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

//TODO OCPP Business Logic Modify
async function service(_request, _response, next) {
  // Request
  const params = {
    chg_id: _request.body.chg_id, // 충전기 인덱스 (int),     Charger ID
    transactionId: _request.body.transactionId, // 트랜잭션 ID (String),    Transaction ID
    target_soc: _request.body.target_soc, // 목표 SoC (int),          Target SoC
  };

  /*
    What is transactionId (STRING)?
    sb_charging_logs - cl_id (BIGINT) ??
  */

  try {
    await models.sb_charging_log.update(
      {
        desired_percent: params.target_soc,
        updatedAt: new Date(),
      },
      {
        where: {
          cl_transaction_id: params?.transactionId,
          chg_id: params?.chg_id,
        },
      }
    );

    // Response (JSON format)  "result" : {}
    const result = {};
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
