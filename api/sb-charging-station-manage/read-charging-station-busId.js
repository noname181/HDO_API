'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/charging-stations-busId'],
  method: 'get',
  checkToken: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const busIds = await models.sequelize.query(`
  SELECT busiId, bnm FROM EnvChargers GROUP BY busiId
    `);

    _response.json({
      result: busIds,
    });
  } catch (error) {
    console.log(error);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
