/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 수정
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/coupon/:couponId'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const couponId = _request.params.couponId;

  body.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;

  try {
    const coupon = await models.CouponModel.findByPk(couponId);
    if (!coupon) throw 'NOT_EXIST_COUPON';

    await coupon.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 수정된 충전기 모델 리로딩
    const updatedCoupon = await models.CouponModel.findByPk(couponId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    _response.json({
      status: '200',
      result: updatedCoupon,
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
