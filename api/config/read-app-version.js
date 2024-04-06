/**
 * Created by Sarc bae on 2023-05-30.
 * divCode로 Config 개별조회 by divCode API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/config/appversion'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.MOBILE],
  logDisable: true,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const config = await models.Config.findOne({
      where: { divCode: 'APP_VERSION' },
      attributes: ['divCode', 'cfgVal'],
      order: [['createdAt', 'DESC']],
    });

    // 조회된 사용자 목록 응답
    _response.json({
      status: '200',
      result: config,
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
