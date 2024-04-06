/**
 * Created by Jackie Yoon on 2023-07-26.
 * 충전기 모델 id로 조회
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/notice/:noticeId'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const noticeId = _request.params.noticeId;

  try {
    // 해당 충전기 모델이 존재하는지 확인
    const notice = await models.NoticeModel.findByPk(noticeId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!notice) throw 'NOT_EXIST_NOTICE';

    // 충전기 모델 응답
    _response.json({
      result: notice,
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

  if (_error === 'NOT_EXIST_NOTICE') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
