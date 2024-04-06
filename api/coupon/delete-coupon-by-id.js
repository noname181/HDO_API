/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 삭제
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/coupon/:couponId'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.delete],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const couponId = _request.params.couponId;

  try {
    // 해당 츙전기 모델이 DB에 존재하는지 확인
    const coupon = await models.CouponModel.findByPk(couponId);
    if (!coupon) throw 'NOT_EXIST_CHARGER_MODEL';

    const deletedCoupon = await coupon.destroy({ force: false });

    // 삭제된 충전기 모델 정보 응답
    _response.json({
      status: '200',
      result: deletedCoupon,
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
