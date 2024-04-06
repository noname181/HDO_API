/**
 * Created by SeJin Kim on 2023-08-31
 * OCPP -> Request -> BE
 * 광고 다운로드 완료 시 업데이트
 * Update on completion of the ad downloaded
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");

module.exports = {
  path: ["/ad-download-complete-report"],
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
    chg_id: _request.body.chg_id, // 충전기 인덱스 (int),     Charger ID
    version: _request.body.version, // 버전 (String),           VERSION
  };

  try {
    const updatedWho = "OCPP";

    // UPDATE  sb_chargers - adVersion
    await models.sb_charger.update(
      {
        adVersion: params?.version,
        updatedAt: new Date(),
        updatedWho: updatedWho,
      },
      {
        where: { chg_id: params?.chg_id },
      }
    );

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
