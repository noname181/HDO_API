/**
 * Created by Jackie Yoon on 2023-07-31.
 * 결제 수단 순번 수정 API
 */
'use strict';
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/pay-method/:payMethodId'],
  method: 'put',
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
    const payMethod = await models.PayMethod.findByPk(payMethodId);
    if (!payMethod) throw 'NOT_EXIST_PAY_METHOD';
    if (!payMethod.userId && !payMethod.orgId) throw 'INVALID_PAY_METHOD';

    let userPayMethod;
    // 모바일 이용자 결제 수단 변경
    if (payMethod.userId && payMethod.userId === userId) {
      // 해당 이용자의 모든 결제 수단 확인
      userPayMethod = await models.PayMethod.findAll({
        where: { userId: userId },
        attributes: {
          exclude: ['deletedAt'],
        },
        order: [['seq', 'ASC']],
      });
      if (!userPayMethod) throw 'NOT_EXIST_USER_PAY_METHOD';
    }
    // 법인 등록카드 결제 수단 변경
    else if (payMethod.orgId) {
      userPayMethod = await models.PayMethod.findAll({
        where: { orgId: payMethod.orgId },
        attributes: {
          exclude: ['deletedAt'],
        },
        order: [['seq', 'ASC']],
      });
      if (!userPayMethod) throw 'NOT_EXIST_BIZ_PAY_METHOD';
    } else {
      throw 'INVALID_REQUEST';
    }

    // 이미 기본 결제수단으로 요청한 것이므로 리턴
    // 기본 결제수단 seq = 0
    if (payMethod.seq < 1) {
      _response.json({
        status: '200',
        result: userPayMethod.sort((a, b) => a.seq - b.seq),
      });
      return;
    }

    const payMethodLength = userPayMethod.length;

    // 결제수단 순서 변경
    const updatedPayMethod = [];
    let seq = 0;
    let isChangedPrimary = false;
    for (let i = 0; i < payMethodLength; i++) {
      console.log(userPayMethod[i].id.toString() === payMethodId.toString(), i, seq);
      if (userPayMethod[i].id.toString() === payMethodId.toString()) {
        userPayMethod[i].dataValues.seq = 0;
        isChangedPrimary = true;
      } else userPayMethod[i].dataValues.seq = !isChangedPrimary ? seq + 1 : seq;
      seq += 1;

      await models.PayMethod.update(userPayMethod[i].dataValues, {
        where: { id: userPayMethod[i].dataValues.id },
      });

      updatedPayMethod.push(userPayMethod[i].dataValues);
    }

    // 변경된 결과 출력
    _response.json({
      status: '200',
      result: updatedPayMethod.sort((a, b) => a.seq - b.seq),
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

  if (_error === 'NOT_EXIST_PAY_METHOD') {
    _response.error.notFound(_error, '요청한 결제 수단이 존재하지 않습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_PAY_METHOD') {
    _response.error.notFound(_error, '요청한 결제 수단이 존재하지 않습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_USER_PAY_METHOD') {
    _response.error.notFound(_error, '요청한 사용자의 결제 수단이 존재하지 않습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_BIZ_PAY_METHOD') {
    _response.error.notFound(_error, '요청한 법인의 결제 수단이 존재하지 않습니다.');
    return;
  }

  if (_error === 'INVALID_PAY_METHOD') {
    _response.error.badRequest(_error, '올바르지 않은 결제 수단입니다.');
    return;
  }

  if (_error === 'INVALID_REQUEST') {
    _response.error.badRequest(_error, '올바르지 않은 요청입니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
