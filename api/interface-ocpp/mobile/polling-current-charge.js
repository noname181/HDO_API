/**
 * Created by hdc on 2023-10-14.
 * 앱에서 CL 로그 폴링
 */
'use strict';
let models = require('../../../models');
let sequelize = require('sequelize');
let moment = require('moment');
module.exports = {
  path: ['/polling-current-charge'],
  method: 'post',
  checkToken: true,
  roles: ['admin', 'mobile', 'biz'],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  /**
   *
   * */
  let body = _request.body;
  let chg_id = body?.chg_id;
  // optional column : for charger_states, now it is default 1
  let connId = body?.conn_id ?? 1;

  try {
    if (!chg_id) throw 'NEED_CHG_ID';
    let userId = body.userId ? body.userId : _request.user.id || _request.user.sub;

    let user = await models.UsersNew.findOne({
      where: { id: userId },
    });
    if (!user) throw 'NOT_EXIST_USER';

    let current_charging_info = await models.sequelize.query(
      `SELECT
                    CL.cl_start_datetime,
                    CL.cl_end_datetime,
                    CST.cs_charging_state,
                    CL.remain,
                    CL.soc,
                    C.chg_charger_id,
                    CS.chgs_name,
                    CL.chg_id, 
                    case CM.speedType when '1' then '초고속' when '2' then '고속' when '3' then '중속' when '4' then '완속' ELSE '초고속' END AS speedTypeNm,
                    CM.maxKw AS maxKw,
                    CL.desired_kwh,
                    CL.appliedUnitPrice,
                    IFNULL(CL.cl_kwh,0) as cl_kwh,
                    CL.desired_percent, 
                    (SELECT 'name' FROM Orgs where id = CS.orgId) AS org_name
                  FROM sb_charging_logs CL
                  INNER JOIN sb_chargers C ON C.chg_id = CL.chg_id
                  INNER JOIN sb_charging_stations CS ON CS.chgs_id = CL.chgs_id
                  INNER JOIN ChargerModels CM ON CM.id = C.chargerModelId
                  INNER JOIN sb_charger_states CST ON CST.chg_id = C.chg_id AND CST.cs_channel = :cs_channel
                  WHERE
                    CL.usersNewId = :usersNewId
                    AND CL.chg_id = :chg_id
                  ORDER BY CL.cl_id desc
                  LIMIT 1
            `,
      {
        replacements: { cs_channel: connId, usersNewId: userId, chg_id: chg_id },
        type: sequelize.QueryTypes.SELECT,
        raw: true,
      }
    );
    let chargingInfo;
    let updatedChargingInfo = {};
    if (current_charging_info.length > 0) {
      chargingInfo = current_charging_info[0];
      updatedChargingInfo = Object.assign({}, chargingInfo);
      updatedChargingInfo.expected_cost = current_charging_info[0]?.cl_kwh * current_charging_info[0]?.appliedUnitPrice * 0.001;
    }
    const result = {
      status: '200',
      result: chargingInfo ? [updatedChargingInfo] : [],
    }

    const chargerState = await models.sb_charger_state.findOne({
      where: { chg_id: chg_id, cs_channel: connId },
    });
    if(chargerState) {
      result["chargingState"] = chargerState?.cs_charging_state
    }
    _response.json(result);
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '충전기 정보를 찾을 수 없습니다.');
    return;
  }

  if (_error === 'NEED_CHG_ID') {
    _response.error.badRequest(_error, '충전기 아이디(인덱스)가 누락되었습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_USER') {
    _response.error.badRequest(_error, '사용자(userId)를 찾을 수 없습니다..');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
