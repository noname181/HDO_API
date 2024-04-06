'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/code/branch/upper-div-code'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  let options = {
    where: {
      divCode: 'BRANCH',
      deletedAt: null,
      upperDivCode: { [Op.ne]: null },
    },
    attributes: ['upperDivCode'],
    group: 'upperDivCode',
    distinct: true,
  };

  try {
    const codes = await models.CodeLookUp.findAll(options);

    // 조회된 목록 응답
    _response.json({
      totalCount: codes.length,
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
