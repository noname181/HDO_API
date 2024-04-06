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
  path: ['/vehicles'],
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

  const userId = _request?.query?.user_id ? _request?.query?.user_id : '';
  // // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
  let where = {};
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
    order: [
      ['isPrimary', orderByQueryParam],
      ['updatedAt', orderByQueryParam],
    ],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };
  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: vehicles } = await models.Vehicle.findAndCountAll(options);

    // 조회된 사용자 목록 응답
    _response.json({
      totalCount: totalCount,
      result: vehicles,
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
