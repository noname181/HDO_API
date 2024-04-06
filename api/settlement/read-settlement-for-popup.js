'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Sequelize } = require('sequelize');
const { Op } = sequelize;

module.exports = {
  path: ['/settlement/popup'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { type, data_day } = _request.query;

  try {
    let result, totalCount;
    if (type === 'BANKING') {
      let { count, rows: payments } = await models.bank_transaction_record.findAndCountAll({
        where: {
          SDODT: data_day,
        },
      });
      result = payments;
      totalCount = count;
    } else if (type === 'ERP') {
      let { count, rows: payments } = await models.erp_requests_tb.findAndCountAll({
        where: {
          data_day: data_day.replace(/-/g, ''),
          req_type: 'F',
        },
      });
      result = payments;
      totalCount = count;
    }

    _response.json({
      totalCount,
      result,
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

function parseSalesDate(sale_date) {
  const year = sale_date.slice(0, 4);
  const month = sale_date.slice(4, 6);
  const day = sale_date.slice(6, 8);

  return `${year}-${month}-${day}`;
}
function formatKwh(num) {
  if (!num) {
    return '';
  }
  return parseFloat(num / 1000).toFixed(2);
}
