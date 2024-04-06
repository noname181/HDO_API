'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Op } = sequelize;

module.exports = {
  path: ['/charger-error-history'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page && _request.query.page > 0 ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const order = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  const startDate = _request.query.startDate || null;
  const endDate = _request.query.endDate || null;
  const searchKey = _request.query.searchKey ? _request.query.searchKey.trim() : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal.trim() : '';

  const where = {
    [Op.and]: [],
  };

  if (startDate || endDate) {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      where[Op.and].push({ createdAt: { [Op.between]: [start, end] } });
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where[Op.and].push({ createdAt: { [Op.gte]: start } });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where[Op.and].push({ createdAt: { [Op.lte]: end } });
    }
  }

  const SEARCH_KEY = {
    CHGS_STATION_ID: 'chgs_station_id',
    CHG_STATION_NAME: 'chgs_name',
    CHG_ID: 'chg_charger_id',
  };

  let include = [
    {
      model: models.sb_charger,
      paranoid: false,
      attributes: { exclude: ['deletedAt'] },
      as: 'chargerUseLog',
    },
    {
      model: models.sb_charging_station,
      foreignKey: 'chgs_id',
      attributes: { exclude: ['deletedAt'] },
      as: 'chargingStationUseLog',
      paranoid: false,
    },
  ];

  switch (searchKey) {
    case SEARCH_KEY.CHGS_STATION_ID:
      where[Op.and].push({
        '$chargingStationUseLog.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' },
      });
      break;
    case SEARCH_KEY.CHG_STATION_NAME:
      where[Op.and].push({
        '$chargingStationUseLog.chgs_name$': { [Op.like]: '%' + searchVal + '%' },
      });
      break;
    case SEARCH_KEY.CHG_ID:
      where[Op.and].push({
        '$chargerUseLog.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' },
      });
      break;
    default:
      if (searchVal) {
        where[Op.and].push({
          [Op.or]: [
            { '$chargingStationUseLog.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
            { '$chargingStationUseLog.chgs_name$': { [Op.like]: '%' + searchVal + '%' } },
            { '$chargerUseLog.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' } },
          ],
        });
      }
      break;
  }
  if (_request.query.reason)
    where[Op.and].push({
      reason: _request.query.reason,
    });

  try {
    const { count: totalCount, rows: data } = await models.sb_charging_log.findAndCountAll({
      where,
      include,
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
      order: [['createdAt', order]],
    });

    _response.json({
      totalCount,
      result: data,
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
