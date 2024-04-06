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
  path: ['/config/:divCode'],
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
  const divCode = _request.params.divCode ? _request.params.divCode.toUpperCase() : null; // 요청 파라미터로 /search/뒤에 붙이던가, query 키 search를 통해 전달.
  if (!divCode) throw 'NO_DIVCODE_INPUT';
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
  let options = {
    include: [
      // {model: models.CodeLookUp, foreignKey: 'parentId', as: 'childs', attributes: {exclude: ['deletedAt']}, constraints: false}
      // {model: models.CodeLookUp, as: 'children', required: false, where: whereChildren}
    ],
    attributes: {
      exclude: ['deletedAt'],
    },
  };

  try {
    const config = await models.Config.findOne({
      where: { divCode: divCode },
      include: [],
      attributes: {
        exclude: ['deletedAt'],
      },
      order: [['id', orderByQueryParam]],
    });
    if (!config) throw 'NOT_EXIST_CONFIG';

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

  if (_error === 'NO_DIVCODE_INPUT') {
    _response.error.badRequest(_error, '잘못 되었거나, 사용할 수 없는 DIVCODE가 입력되었습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CONFIG') {
    _response.error.badRequest(_error, '해당 divCode에 대한 Config 데이터가 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
