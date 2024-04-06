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
  path: ['/pay-method'],
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

  const userId = _request.user.id || _request.user.sub;
  const role = _request.user.roles || 'MOBILE';

  let where = {};

  let options = {
    where: where,
    include: [
      // TODO 하나의 외래키에 대해 다중 테이블 join
      // {model: models.UsersNew, as: 'createdByAdmin', attributes: ['id', 'name']},
      // {model: models.UsersNew, as: 'updatedByAdmin', attributes: ['id', 'name']},
      // {model: models.UsersNew, as: 'createdBy', attributes: ['id', 'name']},
      // {model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'name']},
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: [
      ['seq', 'ASC'],
      ['id', orderByQueryParam],
    ],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };

  if (role === 'MOBILE') {
    where.userId = userId;

    // 모바일에서 불필요 properties 생략
    options.attributes.exclude.push('alias');
    options.attributes.exclude.push('billingKey');
    options.attributes.exclude.push('cardBrand');
    options.attributes.exclude.push('userId');
    options.attributes.exclude.push('orgId');
    options.attributes.exclude.push('updatedAt');
  } else {
    const webUser = await models.UsersNew.findByPk(userId, {
      // attributes: {exclude: []},
      // include: {
      // 	model: models.Org,
      // 	foreignKey: 'orgId'
      // }
    });
    // if (user) {
    // 	// 모바일 사용자 중 법인 회원
    //
    // } else {
    // 	// 웹 사용자
    //
    // };
    where.orgId = webUser.orgId;
  }

  try {
    // 위 조건에 대한 목록 조회
    const { count: totalCount, rows: payMethod } = await models.PayMethod.findAndCountAll(options);

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
