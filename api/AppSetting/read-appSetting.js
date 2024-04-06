/**
 * Created by Sarc bae on 2023-05-11
 * 차량 조회 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/appSetting'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 9999;
  const userId = _request.user.id;
  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
  let where = {};
  if (where[Op.and] === undefined) where[Op.and] = [];
  if (userId) {
    where[Op.or] = [];
    where[Op.or].push({ usersNewId: userId });
  }
  let options = {
    where: where,
    include: [
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: [['updatedAt', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };
  try {
    let result;
    const setting = await models.AppSetting.findOne(options);
    if (setting) {
      result = setting;
    } else {
      const body = {};
      body.createdAt = body.updatedAt = new Date();
      body.createdWho = userId;
      body.updatedWho = userId;
      body.usersNewId = userId;
      body.app_version = '1.0.0';
      const resultSave = await models.AppSetting.create(body);
      resultSave.save();
      result = resultSave;
    }
    _response.json({
      result: result,
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
