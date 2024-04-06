/**
 * Created by Sarc Bae on 2023-06-21.
 * Config 삭제 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/config/:configId'],
  method: 'delete',
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
    // 해당 Config 정보 조회
    const config = await models.Config.findByPk(configId);
    if (!config) throw 'NOT_EXIST_CONFIG';

    // 해당 Config 정보 삭제
    const deletedConfig = await config.destroy({
      include: [],
      attributes: {
        exclude: ['deletedAt'],
      },
      force: true, // 삭제시 원상복구 불가능하도록 설정
    });

    // 삭제된 Config 정보 응답
    _response.json({
      status: '200',
      result: deletedConfig,
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
