/**
 * Created by Sarc bae on 2023-06-30.
 * 에러코드 조회 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/error-codes'],
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
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 1000;

  // 조회용 쿼리
  const searchWord = _request.query.search || null; // 요청 파라미터로 /search/뒤에 붙이던가, query 키 search를 통해 전달.
  const select = _request.query.select ? _request.query.select.toUpperCase() : 'ALL';

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  let where = {};

  if (searchWord) {
    if (select === 'ALL') {
      where[Op.or] = [
        { errorCode: { [Op.like]: '%' + searchWord + '%' } },
        { errorMsg: { [Op.like]: '%' + searchWord + '%' } },
        { solution: { [Op.like]: '%' + searchWord + '%' } },
      ];
    }
    if (select === 'CODE') {
      where[Op.or] = [{ errorCode: { [Op.like]: '%' + searchWord + '%' } }];
    }
    if (select === 'MSG') {
      where[Op.or] = [{ errorMsg: { [Op.like]: '%' + searchWord + '%' } }];
    }
    if (select === 'SOLUTION') {
      where[Op.or] = [{ solution: { [Op.like]: '%' + searchWord + '%' } }];
    }
  }

  let options = {
    where: where,
    include: [],
    attributes: {
      exclude: ['deletedAt'],
    },
    order: [['errorCode', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };

  try {
    const { count: totalCount, rows: errorCodes } = await models.ErrorCode.findAndCountAll(options);

    // 조회된 목록 응답
    _response.json({
      totalCount: totalCount,
      result: errorCodes,
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

  if (_error === 'WRONG_PARAMETER_TYPE_INPUT') {
    _response.error.badRequest(_error, '입력된 파라미터 타입이 INT가 아닙니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
