/**
 * Created by Sarc bae on 2023-05-30.
 * 웹페이지 실렉트 박스용 코드룩업 조회 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/codelookup', '/codelookup/:divCode', '/codelookup/:divCode/:filterCode'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: true,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // 파라미터
  const divCode = _request.params.divCode ? _request.params.divCode.toString().toUpperCase() : null; // 요청 파라미터로 /search/뒤에 붙이던가, query 키 search를 통해 전달.
  const filterCode = _request.params.filterCode || null; // AREA, BRANCH 전용 파라미터

  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 1000;

  // 관리를 위해 use=false까지 다 조회하는 쿼리(isAll=true : use true/false 다 조회)
  const isAll = (_request.query.isAll ? _request.query.isAll.toLowerCase() === 'true' : null) ?? null; // 요청 파라미터로 /search/뒤에 붙이던가, query 키 search를 통해 전달.

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  let where = {};

  if (isAll || divCode) where[Op.and] = [];

  if (!isAll) {
    if (where[Op.and] === undefined) where[Op.and] = [];
    where[Op.and].push({ use: true });
  }

  where.descVal = { [Op.ne]: null };
  where.descInfo = { [Op.ne]: null };

  let options = {
    where: where,
    include: [],
    attributes: {
      exclude: ['deletedAt'],
    },
    order: [
      ['id', orderByQueryParam],
      ['sequence', orderByQueryParam],
    ],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };

  try {
    if (filterCode) {
      // AREA, BRANCH 전용 파라미터 필터링.
      if (divCode !== 'AREA') throw 'NOT_VALID_REQUEST';
      where[Op.and].push({ divCode: 'BRANCH' });
      where[Op.and].push({ upperDivCode: filterCode });
      where[Op.and].push({ use: true });
    } else {
      // filterCode가 안들어와서 정상적으로 divCode 필터링을 할 경우
      if (divCode) {
        where[Op.and].push({ divCode: divCode });
      }
    }

    const { count: totalCount, rows: codes } = await models.CodeLookUp.findAndCountAll(options);

    // 조회된 목록 응답
    _response.json({
      totalCount: totalCount,
      result: codes,
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

  if (_error === 'NOT_VALID_REQUEST') {
    _response.error.badRequest(_error, '올바른 요청이 아닙니다.');
    return;
  }

  if (_error === 'WRONG_PARAMETER_TYPE_INPUT') {
    _response.error.badRequest(_error, '입력된 파라미터 타입이 INT가 아닙니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
