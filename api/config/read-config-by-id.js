'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/config/details/:configId'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const configId = _request.params.configId;

  try {
    if (!configId) throw 'NOT_EXIST_CONFIG';
    // 해당 Config 정보 조회
    const config = await models.Config.findByPk(configId);
    if (!config) throw 'NOT_EXIST_CONFIG';

    // 삭제된 Config 정보 응답
    _response.json({
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

  if (_error === 'NOT_EXIST_CONFIG') {
    _response.error.notFound(_error, '해당 ID에 대한 Config가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
