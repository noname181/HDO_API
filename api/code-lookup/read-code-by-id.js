/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const Sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = Sequelize.Op;

module.exports = {
  path: '/codelookup/details/:codeId',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  logDisable: true,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const codeId = _request.params.codeId;

  try {
    if (!codeId) throw 'NOT_EXIST_CODE_ID';

    const code = await models.CodeLookUp.findByPk(codeId);
    if (!code) throw 'NOT_EXIST';

    _response.json({
      result: code,
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

  if (_error === 'NOT_EXIST') {
    _response.error.notFound(_error, '소속 ID가 입력되지 않았습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CODE_ID') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
