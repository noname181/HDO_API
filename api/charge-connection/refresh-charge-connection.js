'use strict';
require('dotenv').config();
const models = require('../../models');
const _ = require('lodash');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/charge-connections/refresh',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const chg_id = _request.query.chg_id;

    let options = {
      where: {
        chg_id: chg_id,
      },
      attributes: [
        'chg_id',
        'currentBatteryPercent',
        'timeCharged',
        'startTime',
        'estimateTime',
        'endTime',
        'chargeAmountKwh',
        'chargeAmountPercent',
        'chargeStatus',
        'bookingId',
      ],
      include: [
        {
          model: models.sb_charger,
          as: 'charger',
          attributes: ['chg_id', 'chg_charger_id'],
          include: [
            {
              model: models.ChargerModel,
              as: 'chargerModel',
              attributes: ['id', 'maxKw', 'speedType'],
            },
          ],
        },
        {
          model: models.sb_charging_station,
          as: 'chargingStation',
          attributes: ['chgs_id', 'chgs_station_id', 'chgs_name'],
        },
        {
          model: models.Booking,
          as: 'booking',
          attributes: ['unitPrice', 'totalPrice', 'maxParkFee'],
        },
      ],
      order: [['id', 'DESC']],
    };

    _response.json(await models.sb_charge_connection.findOne(options));
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  const chg_id = _request.query.chg_id;
  if (!chg_id) next('Missing parameters');
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CHARGE_CONNECTION') {
    _response.error.notFound(_error, '해당 ID에 대한 FAQ 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
