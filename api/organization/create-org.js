'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/orgs',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = await _request.body; // 수정될 소속 정보

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.createdWho = userId;
  body.updatedWho = userId;

  try {
    // 전달된 body로 업데이트
    const createOrg = await models.Org.create(body);

    // 수정된 정보 응답
    _response.json({
      result: createOrg,
    });
  } catch (e) {
    next('ERROR_REGISTER');
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'ERROR_REGISTER') {
    _response.error.notFound(_error, '작성되지 않았습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
