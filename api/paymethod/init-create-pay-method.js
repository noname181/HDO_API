/**
 * Created by Sarc Bae on 2023-06-13.
 * 결제수단 등록 API - 1. 빌키 요쳥정보 등록
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const axios = require('axios');
const moment = require('moment');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/pay-method/init',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const responseUrl =
    _request.headers.host === 'localhost:8080' ? 'http://localhost:8080' : 'https://' + _request.headers.host;
  const body = _request.body;

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  const moment1 = moment().format('YYYYMMDDHHmm');

  const device = _request.query.device ? _request.query.device.toLowerCase() : 'mobile';
  const returnUrl = _request.query.returnUrl ? _request.query.returnUrl : null;
  const payMethodLimit = 999; // TODO 결제수단 등록 제한(기획 확정시 수정)

  // const transaction = await models.sequelize.transaction();
  let result;
  let _where = {};

  try {
    // 필수값 정의(자동으로 만들어지는 pk 제외)
    if (!_request.headers.authorization) throw 'NO_REQUIRED_INPUT';
    const _accessToken = await _request.headers.authorization;

    if (device === 'mobile') {
      // endpoint 모바일

      if (_request.user.roles == 'MOBILE') {
        // 개인 모바일 회원
        _where.userId = await userId;
      } else {
        // 법인 모바일 회원
        const user = await models.User.findByPk(userId, {
          attributes: {
            exclude: ['deletedAt'],
          },
        });

        _where.orgId = (await user?.orgId) || 1;
      }
    } else {
      // endpoint PC(웹)

      const webUser = await models.UsersNew.findByPk(userId, {
        attributes: {
          exclude: ['deletedAt'],
        },
      });

      if (!webUser && !webUser.orgId) throw 'NOT_IDENTIFY_ORGANIZATION';
      _where.orgId = await webUser.orgId;
    }

    const { count: _totalCount, rows: _payMethod } = await models.PayMethod.findAndCountAll({ where: _where });
    if (_totalCount >= payMethodLimit) throw 'REACH_MAX_PAY_METHOD_LIMIT';

    // KICC - 카드등록 요청 api 1 - 빌키 요쳥정보 등록
    const kiccRequest = await axios({
      url: process.env.KICC_REQ_BILLING_REG_1 || 'https://testpgapi.easypay.co.kr/api/trades/webpay',
      method: 'post',
      data: {
        mallId: process.env.KICC_MALL_ID || 'T0012209',
        payMethodTypeCode: '81', // 결제수단 코드 빌키발급 : 81(string)
        currency: '00', // 통화코드 00 : 원화(string)
        amount: 0,
        clientTypeCode: '00', // 결제창 종류 코드 00 : 통합결제창 전용(string)
        returnUrl: returnUrl || responseUrl + process.env.KICC_RETURN_URL, // TODO url query param(returnUrl) 혹은 환경변수상 설정된 return url(finalize-create-pay-method.js 엔드포인트로 가야함). 다만 이 return url은 https 프로토콜만 가능하므로, 현재는 에러가 남(임의로 ssl이 적용된 엔드포인트를 프록시하여 등록테스트는 완료한 상태)
        shopOrderNo: 'payMethodReg-' + moment1,
        deviceTypeCode: device,
        orderInfo: {
          goodsName: '결제수단 등록',
        },
        payMethodInfo: {
          billKeyMethodInfo: {
            certType: '0',
            nickNameUsed: true,
          },
        },
        shopValueInfo: {
          value1: userId || '',
          value2: _accessToken,
          value3: device,
        },
      },
    });

    try {
      const cardLogData = {
        url: _request.url,
        content: kiccRequest,
        userId,
      };
      console.log('pay method init::service::store log::success', kiccRequest);
      await models.AllLogs.create(cardLogData);
    } catch (err) {
      console.log('pay method init::service::store log::err', err);
    }

    if (kiccRequest.status === 200) {
      const _data = kiccRequest.data;

      if (_data.resCd === '0000') {
        result = _data.authPageUrl;
      } else {
        // TODO KICC 실패 catch
      }
    } else {
      throw 'CREATE_PAY_METHOD_FAILED';
    }

    // 조회된 결과 반환
    await _response.json({
      status: '200',
      result: result,
    });
  } catch (e) {
    // await transaction.rollback();
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'CREATE_PAY_METHOD_FAILED') {
    _response.error.badRequest(_error, '결제수단 등록에 실패하였습니다.');
    return;
  }

  if (_error === 'REACH_MAX_PAY_METHOD_LIMIT') {
    _response.error.badRequest(_error, '결제수단 등록 한도에 도달하였습니다.(최고 2개)');
    return;
  }

  if (_error === 'NOT_IDENTIFY_ORGANIZATION') {
    _response.error.badRequest(_error, '해당 사용자가 없거나, 소속이 확인되지 않습니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(accessToken)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
