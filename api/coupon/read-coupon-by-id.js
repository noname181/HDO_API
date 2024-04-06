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
  path: ['/coupon/:couponId'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const couponId = _request.params.couponId;

  try {
    // 해당 충전기 모델이 존재하는지 확인
    const coupon = await models.CouponModel.findByPk(couponId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!coupon) throw 'NOT_EXIST_COUPON';

    // 충전기 모델 응답
    _response.json({
      result: coupon,
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

  if (_error === 'NOT_EXIST_COUPON') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
