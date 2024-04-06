'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Op } = sequelize;

module.exports = {
  path: ['/settlement-erp-request/:date'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const date = _request.params.date || null;
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  const where = {
    [Op.and]: [],
  };

  if (date) {
    where[Op.and].push({ data_day: date.replace(/-|\//g, '') });
  }

  let options = {
    where: where,
    order: [['id', orderByQueryParam]],
  };

  try {
    const { count: totalCount, rows } = await models.erp_requests_tb.findAndCountAll(options);

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
