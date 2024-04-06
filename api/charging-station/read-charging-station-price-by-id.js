/**
 * Created by Sarc bae on 2023-07-14.
 * 충전소 조회 API
 * * TODO 우선 hdo 충전소 마커만 조회
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/charge-stations-price/:chgs_id'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chgs_id = parseInt(_request.params.chgs_id);

  const option = {
    include: [
      {
        model: models.UnitPriceSet,
        as: 'unitPriceSet',
        attributes: {
          exclude: [
            'id',
            'createdWho',
            'updatedWho',
            'deletedAt',
            'unitPriceSetName',
            'registerDate',
            'isUsed',
            'createdAt',
            'updatedAt',
          ],
        },
      },
    ],
    exclude: ['createdWho', 'updatedWho', 'deletedAt'],
  };

  try {
    const data = await models.sb_charging_station.findByPk(chgs_id, option);
    if (!data) throw 'NOT_EXIST_CHARGE_STATION';
    const { priceType, fixedPrice, unitPriceSet } = data;

    _response.json({
      result: { priceType, fixedPrice, unitPriceSet },
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

  _response.error.unknown(_error.toString());
  next(_error);
}
