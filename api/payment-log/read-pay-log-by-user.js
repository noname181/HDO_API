/**
 * Created by Sarc Bae on 2023-07-21.
 * 결제 수단 조회 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/user/payment-log'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  const userId = _request.user.id;

  let options = {
    where: {
      userId,
    },
    include: [
      {
        model: models.UsersNew,
        as: 'user',
        attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
      },
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: [['id', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };

  try {
    // 위 조건에 대한 목록 조회
    const { count: totalCount, rows: payMethod } = await models.PaymentLog.findAndCountAll(options);

    // 조회된 사용자 목록 응답
    _response.json({
      status: '200',
      totalCount: totalCount,
      result: payMethod,
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

// true/false 분기처리가 필요한 쿼리용 함수
function convertQueryParam(value) {
  const lowercasedValue = value?.toLowerCase();

  return lowercasedValue === 'true'
    ? true
    : lowercasedValue === 'false'
    ? false
    : typeof value === 'string' && value !== ''
    ? value
    : undefined;
}
