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
  path: ['/subcodelookup/code/:divCode'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // 파라미터
  const divCode = _request.params.divCode;

  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 1000;

  if (!divCode) throw 'NOT_VALID_REQUEST';
  try {
    const { count: totalCount, rows: codes } = await models.CodeLookUp.findAndCountAll({
      where: {
        divCode: divCode,
        isSubCode: true,
      },
      order: [['createdAt', 'DESC']],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
    });

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
