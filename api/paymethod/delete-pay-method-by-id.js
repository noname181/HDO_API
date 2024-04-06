/**
 * Created by Sarc Bae on 2023-07-24.
 * 결제수단 삭제 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/pay-method/:payMethodId'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const payMethodId = _request.params.payMethodId;
  const userId = _request.user.id || _request.user.sub;

  try {
    // 해당 payMethod 정보 조회
    const payMethod = await models.PayMethod.findByPk(payMethodId, {
      attributes: {
        exclude: ['deletedAt', 'alias', 'billingKey', 'cardBrand', 'updatedAt'],
      },
    });
    if (!payMethod) throw 'NOT_EXIST_PAYMETHOD';

    // 삭제 권한 체크
    const user = await models.User.findByPk(userId);
    if (user) {
      // 모바일 사용자(개인)는 자기가 등록한 것만 삭제하도록 제한
      if (user.orgId.toString() === '1') {
        if (!(payMethod.userId && payMethod.userId === userId)) throw 'NOT_AUTHORIZED_DELETION_MOB';
      }
      // 모바일 사용자(법인)은 결제수단 삭제 불가
      else {
        throw 'NOT_AUTHORIZED_DELETION_BIZ';
      }
    } else {
      // 웹 사용자는 자기 소속의 결제수단만 삭제 제한
      const webUser = await models.UsersNew.findByPk(userId);
      if (!webUser) throw 'NOT_EXIST_USER';
      if (!payMethod.orgId) throw 'NOT_EXIST_PAYMETHOD_ORG';
      if (webUser.orgId !== payMethod.orgId) throw 'NOT_AUTHORIZED_DELETION_WEB';
    }
    if (!payMethod.userId && !payMethod.orgId) throw 'INVALID_PAYMETHOD';

    await payMethod.destroy({
      include: [],
      force: true, // 삭제시 원상복구 불가능하도록 설정
    });

    // 삭제된 payMethod 정보 응답
    _response.json({
      status: '200',
      result: payMethod,
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

  if (_error === 'NOT_EXIST_PAYMETHOD') {
    _response.error.notFound(_error, '해당 ID에 대한 PayMethod가 존재하지 않습니다.');
    return;
  }

  if (_error === 'INVALID_PAYMETHOD') {
    _response.error.badRequest(_error, '올바르지 않은 결제수단입니다.');
    return;
  }

  if (_error === 'NOT_EXIST_USER') {
    _response.error.notFound(_error, '요청한 사용자 정보가 존재하지 않습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_PAYMETHOD_ORG') {
    _response.error.notFound(_error, '결제수단에 등록된 소속 정보가 없습니다.');
    return;
  }

  if (_error === 'NOT_AUTHORIZED_DELETION_MOB') {
    _response.error.badRequest(_error, '허용되지 않은 요청입니다.');
    return;
  }

  if (_error === 'NOT_AUTHORIZED_DELETION_BIZ') {
    _response.error.badRequest(_error, '허용되지 않은 요청입니다.');
    return;
  }

  if (_error === 'NOT_AUTHORIZED_DELETION_WEB') {
    _response.error.badRequest(_error, '허용되지 않은 요청입니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
