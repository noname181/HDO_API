/**
 * Created by Sarc Bae on 2023-06-01.
 * 충전소id로 개별 충전소 조회 API
 */
'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: ['/chargers/:chargerId', '/charging-stations/:chargingStationId/chargers/:chargerId'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargingStationId = _request.params.chargingStationId;
  const chargerId = _request.params.chargerId;

  try {
    // 해당 userId에 대한 사용자 정보 조회(권한 및 사용자 그룹 포함하여 조회)
    const charger = await models.sb_charger.findByPk(chargerId, {
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        {
          model: models.sb_charging_station,
          as: 'chargingStation',
          attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
        },
        {
          model: models.ChargerModel,
          as: 'chargerModel',
          attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
        },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });
    if (!charger) throw 'NOT_EXIST_CHARGER';
    if (!!chargingStationId && chargingStationId != charger.dataValues.chgs_id) throw 'CHARGING_STATION_ID_NOT_MATCHED';

    // 조회된 사용자 정보 응답
    _response.json({
      result: charger,
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

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '해당 ID에 대한 충전기가 존재하지 않습니다.');
    return;
  }

  if (_error === 'CHARGING_STATION_ID_NOT_MATCHED') {
    _response.error.notFound(_error, '해당 충전소에는 해당 id의 충전기가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
