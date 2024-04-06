'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Op } = sequelize;

module.exports = {
  path: ['/settlement-result-pg/:date'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const date = _request.params.date || null;

  const where = {
    [Op.and]: [],
  };

  if (date) {
    where[Op.and].push({ payment_date: date.replace(/-|\//g, '') });
  }

  let options = {
    where: where,
    include: [
      {
        model: models.sb_charger,
        as: 'charger',
        attributes: ['mall_id', 'chg_charger_id'],
        include: [
          {
            model: models.sb_charging_station,
            as: 'chargingStation',
            attributes: ['chgs_name', 'chgs_station_id'],
          },
        ],
      },
    ],
  };

  try {
    const { count: totalCount, rows } = await models.KiccTransactionRecord.findAndCountAll(options);

    _response.json({
      totalCount,
      result: rows,
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
