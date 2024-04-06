/**
 * Created by inju on 2023-06-05.
 * Refactored by Jackie Yoon on 2023-07-25.
 * 충전기 모델 생성
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/trouble'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.createdAt = body.updatedAt = new Date();

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.createdWho = userId;
  body.updatedWho = userId;

  try {
    if (!body.chgs_id || !body.troubleTitle || !body.troubleDesc) throw 'NO_REQUIRED_INPUT';
    const trouble = await models.TroubleReport.create(body);
    trouble.save();

    _response.json({
      result: trouble,
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
  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(category, title, content)');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
