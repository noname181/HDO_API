/**
 * Created by Sarc Bae on 2023-06-07.
 * 충전소 삭제 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/charging-stations-manage/:chgs_id',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chgs_id = _request.params.chgs_id;
  const force = _request.query.force === 'true'; // Query파라메터로 전달 된 강제 삭제 여부(강제삭제 : row 자체를 삭제. 강제삭제가 아닌경우가 default. 강제삭제가 아닌 경우 deletedAt에 timestamp가 생기면서 조회시 무시됨)

  try {
    // 해당 충전소 정보 조회
    const chargingStation = await models.sb_charging_station.findByPk(chgs_id, {
      include: [{ model: models.sb_charger, as: 'chargers', attributes: { exclude: ['deletedAt'] } }],
    });
    if (!chargingStation) throw 'NOT_EXIST_CHARGING_STATION';

    // 소속된 충전기가 존재하는지 조회 후 존재할 경우 삭제 방지
    if (chargingStation.dataValues.chargers.length > 0) throw 'CHARGERS_EXIST';

    // 해당 충전소 정보 삭제
    const deletedChargingStation = await chargingStation.destroy({
      include: [
        { model: models.sb_charger, as: 'chargers', attributes: { exclude: ['deletedAt'] } },
        { model: models.Org, as: 'org', attributes: { exclude: ['deletedAt'] }, required: false },
      ],
      attributes: {
        exclude: ['deletedAt'],
      },
      force: force,
    });

    // 삭제된 충전소 정보 응답
    _response.json({
      result: deletedChargingStation,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CHARGING_STATION') {
    _response.error.notFound(_error, '해당 ID에 대한 충전소가 존재하지 않습니다.');
    return;
  }

  if (_error === 'CHARGERS_EXIST') {
    _response.error.badRequest(_error, '삭제실패 - 해당 충전소에 소속된 충전기가 존재합니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
