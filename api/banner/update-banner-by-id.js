/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 수정
 */
'use strict';
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/banner/:bannerId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const bannerId = _request.params.bannerId;

  body.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;

  try {
    const banner = await models.BannerModel.findByPk(bannerId);
    if (!banner) throw 'NOT_EXIST_CHARGER_MODEL';
    await banner.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 수정된 충전기 모델 리로딩
    const updateBanner = await models.BannerModel.findByPk(bannerId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    _response.json({
      status: '200',
      result: updateBanner,
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

  if (_error === 'NOT_EXIST_CHARGER_MODEL') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  if (_error === 'INVALID_SPEED_TYPE') {
    _response.error.badRequest(_error, '허용되지 않은 충전속도로 수정할 수 없습니다.');
    return;
  }

  if (_error === 'INVALID_CON_TYPE') {
    _response.error.badRequest(_error, '허용되지 않은 커넥터 타입으로 수정할 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
