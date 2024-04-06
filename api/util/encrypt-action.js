/**
 * Created by Sarc bae on 2023-05-10.
 * 임시 암호화 api(데이터 직접 삽입용)
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const cryptor = require('../../util/cryptor');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/encrypt/:target'],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const target = _request.params.target;
  const result = target !== '' ? cryptor.encrypt(target) : 'NO_TARGET_INPUT';

  try {
    // 응답
    _response.json({
      originalText: target,
      encryptedResult: result,
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
