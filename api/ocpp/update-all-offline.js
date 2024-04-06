/**
 * Created by SeJin Kim on 2023-08-31
 * Implemented by hdc on 2023-10-13
 * OCPP -> Request -> BE
 * 모든 충전기 상태를 오프라인으로 상태 변경 (sb_charger_state: cs_charging_state  -> offline )
 * Change status to all chargers offline
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');

module.exports = {
  path: ['/all-chg-offline'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const updatedWho = 'OCPP';
    const cs_charging_state = 'offline';

    // Change the status value of all sb_chargers to INACTIVE
    await models.sb_charger_state.update(
      {
        cs_charging_state: cs_charging_state,
        updatedWho: updatedWho,
      },
      {
        where: {},
      }
    );

    _response.json({});
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
