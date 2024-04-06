/**
 * Created by h on 2023-08-29.
 * 약관 생성
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const moment = require('moment');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/terms'],
  method: 'post',
  checkToken: true,
  roles: [],
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

  const nowHour = moment().tz('Asia/Seoul').format();

  try {
    if (body.id) body.id = undefined;
    if (!body.title || !body.content) throw 'NO_REQUIRED_INPUT';

    body.version = nowHour;

    const terms = await models.Terms.create(body);
    terms.save();

    _response.json({
      result: terms,
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
