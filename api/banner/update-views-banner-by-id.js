/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 수정
 */
'use strict';
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/banner/views/:bannerId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = {};
  const bannerId = _request.params.bannerId;

  try {
    const banner = await models.BannerModel.findByPk(bannerId);
    if (!banner) throw 'NOT_EXIST_BANNER';
    body.view = banner.view + 1;
    await banner.update(body);

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

  if (_error === 'NOT_EXIST_BANNER') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
