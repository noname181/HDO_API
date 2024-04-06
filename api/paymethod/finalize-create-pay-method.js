/**
 * Created by Sarc Bae on 2023-06-13.
 * 결제수단 등록 API - 2. 배치키(빌키)발급 요청
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const axios = require('axios');
const moment = require('moment');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/pay-method/approval',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;

  const moment1 = moment().format('YYYYMMDDHHmmss');
  const moment2 = moment().format('YYYYMMDD');

  const transaction = await models.sequelize.transaction();

  let _where = {};

  try {
    // 필수값 정의(자동으로 만들어지는 pk 제외)
    if (!body.resCd || !body.authorizationId || !body.shopValue1 || !body.shopValue2) throw 'NO_REQUIRED_INPUT';

    if (body.resCd !== '0000') {
      // "resCd":"W002","resMsg":"[USER] 사용자 취소"
      // "resCd":"R102","resMsg":"인증 내역에 존재하지 않는 거래입니다. KICC로 문의바랍니다"
      await transaction.rollback();
      await _response.redirect('hcom'); // TODO 에러 페이지로 전달
      // 하단부에 빌링키 발급요청시에도 에러 있음
    } else {
      const userId = await body.shopValue1;

      const user = await models.User.findByPk(userId, {
        attributes: {
          exclude: ['deletedAt'],
        },
      });

      // 사용자 정보 확인하여 모바일/웹유저 체크 -- 조회된 user 유무. value3는 당장은 안쓰임
      try {
        // body.shopValue2 토큰검증
        _request.user = await verifier.verify(body.shopValue2);
      } catch (e) {
        if (e.toString().includes('Token expired at')) {
          console.error(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + 'EXPIRED_COGNITO_TOKEN');
          // _response.error.unauthorization('EXPIRED_COGNITO_TOKEN', 'AWS Cognito 토큰이 만료되었습니다.(at ' + e?.toString().replace("Error: Token expired at ", "") + ")");
        } else {
          console.error(
            `[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + 'UNAUTHORIZED_COGNITO_TOKEN'
          );
          // _response.error.unauthorization('UNAUTHORIZED_COGNITO_TOKEN', 'AWS Cognito 인증에 에러가 발생하였습니다.: ' + e);
        }

        await transaction.rollback();
        await _response.redirect(process.env.KICC_REDIRECT_URL); // TODO 에러 페이지로 전달
      }

      // KICC - 카드등록 요청 api 2 - 배치키(빌키)발급 요청
      const kiccRequest = await axios({
        url: process.env.KICC_REQ_BILLING_REG_2 || 'https://testpgapi.easypay.co.kr/api/trades/approval',
        method: 'post',
        data: {
          mallId: process.env.KICC_MALL_ID || 'T0012209',
          authorizationId: body.authorizationId,
          shopOrderNo: 'payMethodReg-' + moment1,
          shopTransactionId: 'payMethodReg-' + moment1,
          approvalReqDate: moment2,
        },
      });

      // * LOG KICC data
      try {
        const cardLogData = {
          url: _request.url,
          content: kiccRequest,
          userId,
        };
        console.log('pay method approval::service::store log::success', kiccRequest);
        await models.AllLogs.create(cardLogData);
      } catch (err) {
        console.log('pay method approval::service::store log::err', err);
      }

      // TODO payMethod에 등록(위에서 저장된 userId 사용)
      const _body = {};
      _body.updatedAt = new Date(); // updatedAt의 default 값을 sequelize에서 데이터 생성시 호출하지 못하여 수동으로 추가
      _body.createdWho = userId;
      _body.updatedWho = userId;

      if (kiccRequest.data && kiccRequest.data.resCd === '0000') {
        const _cardInfo = await kiccRequest.data.paymentInfo.cardInfo;

        if (!user) {
          // 1. 웹유저의 요청(pc)
          const webUser = await models.UsersNew.findByPk(userId, {
            attributes: {
              exclude: ['deletedAt'],
            },
          });

          if (!webUser && !webUser.orgId) throw 'NOT_IDENTIFY_ORGANIZATION';
          _where.orgId = await webUser.orgId;
          _body.orgId = await webUser.orgId;
        } else if (user.orgId === 1) {
          // 2-1. 개인 모바일회원 등록 Org DEF(id: 1)
          _where.userId = await userId;
          _body.userId = await userId;
        } else {
          // 2-2. 법인 모바일회원 등록

          if (!user && !user.orgId) throw 'NOT_IDENTIFY_ORGANIZATION';
          _where.orgId = await user.orgId;
          _body.orgId = await user.orgId;
        }

        const { count: _totalCount, rows: _payMethod } = await models.PayMethod.findAndCountAll({ where: _where });
        _body.seq = _totalCount; // TODO seq 세팅

        _body.cardNo = await _cardInfo.cardMaskNo; // "944116******257*"
        _body.alias = (await body.cardNickName) || '';
        _body.billingKey = await _cardInfo.cardNo;
        // _body.acquirerCode = await _cardInfo.acquirerCode;                  // "018"
        _body.cardBrand = await _cardInfo.acquirerName; // "NH농협카드"
        // _body.issuerCode = await _cardInfo.issuerCode;                    // "018"
        _body.cardIssuer = await _cardInfo.issuerName; // "NH체크카드
        // _body.cardBizGubun = await _cardInfo.cardBizGubun;                  // "P" (아마 개인)

        const payMethod = await models.PayMethod.create(_body, {
          transaction: transaction,
        });
        await transaction.commit();

        // 성공시 redirect 될 url - MOBILE APP DEEPLINK url : 앱 내 에러 페이지로 이동(현재는 딥링크 미개발로 인해 url로 설정해둠)
        await _response.redirect(
          process.env.KICC_REDIRECT_URL + '?userId=' + userId || 'https://www.oilbank.co.kr' + '?userId=' + userId
        );
      } else {
        await transaction.rollback();

        // 실패시 redirect 될 url - MOBILE APP DEEPLINK url : 앱 내 에러 페이지로 이동(현재는 딥링크 미개발로 인해 url로 설정해둠)
        await _response.redirect('https://www.oilbank.co.kr');
      }
    }
  } catch (e) {
    await transaction.rollback();
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

  if (_error === 'NOT_IDENTIFY_ORGANIZATION') {
    _response.error.badRequest(_error, '해당 사용자가 없거나, 소속이 확인되지 않습니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(/pay-method/approval)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

/**
 * response example
 *
 *
 * kiccRequest.data = {
 *     "resCd": "0000",
 *     "resMsg": "단독인증 정상",
 *     "mallId": "05574880",
 *     "pgCno": "23072111431010015215",
 *     "shopTransactionId": "230721-trasaction-003",
 *     "shopOrderNo": "test1234",
 *     "amount": 0,
 *     "transactionDate": "20230721114408",
 *     "statusCode": "",
 *     "statusMessage": "",
 *     "msgAuthValue": "1f40415b6ef19545aeb1f5cf74e21bef5a839c5763534ea6f3ef6c533a5296c5",
 *     "escrowUsed": "N",
 *     "paymentInfo": {
 *         "payMethodTypeCode": "11",
 *         "approvalNo": "65559291",
 *         "approvalDate": "20230721114408",
 *         "cardInfo": {
 *             "cardNo": "574880230721BA465449",
 *             "issuerCode": "018",
 *             "issuerName": "NH체크카드",
 *             "acquirerCode": "018",
 *             "acquirerName": "NH농협카드",
 *             "installmentMonth": 0,
 *             "freeInstallmentTypeCode": "00",
 *             "cardGubun": "Y",
 *             "cardBizGubun": "P",
 *             "partCancelUsed": "",
 *             "subCardCd": "",
 *             "cardMaskNo": "944116******257*",
 *             "vanSno": "211112936050",
 *             "couponAmount": 0
 *         },
 *         "cpCode": "",
 *         "multiCardAmount": "",
 *         "multiPntAmount": "",
 *         "multiCponAmount": "",
 *         "bankInfo": {
 *             "bankCode": "",
 *             "bankName": ""
 *         },
 *         "virtualAccountInfo": {
 *             "bankCode": "",
 *             "bankName": "",
 *             "accountNo": "",
 *             "depositName": "",
 *             "expiryDate": ""
 *         },
 *         "mobInfo": {
 *             "authId": "",
 *             "billId": "",
 *             "mobileNo": "",
 *             "mobileAnsimUsed": "",
 *             "mobileCd": ""
 *         },
 *         "prepaidInfo": {
 *             "billId": "",
 *             "remainAmount": 0
 *         },
 *         "cashReceiptInfo": {
 *             "resCd": "",
 *             "resMsg": "",
 *             "approvalNo": "",
 *             "approvalDate": ""
 *         },
 *         "basketInfoList": []
 *     }
 * }
 *
 *
 * 취소시 response
 * {
 *    "authorizationId":"23072118144410630384",
 *    "resCd":"W002",
 *    "resMsg":"[USER] 사용자 취소",
 *    "shopOrderNo":"payMethodReg-202307210914",
 *    "shopValue1":"8613c2e5-5bdc-4f77-ae61-73faf93bf330",
 *    "shopValue2":"eyJraWQiOiJwNEtzVXNCR3ZENmluSzVqZTQrRWY5Tm9xNXdEUzQzXC92eHZrM3hYblhZOD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI4NjEzYzJlNS01YmRjLTRmNzctYWU2MS03M2ZhZjkzYmYzMzAiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtbm9ydGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtbm9ydGhlYXN0LTJfSVRDT0dBWFZYIiwiY2xpZW50X2lkIjoiMjlhbnU4bGRibjVwOW5pNDFkMzlpa2t0bDciLCJvcmlnaW5fanRpIjoiMmUxYjI3MDAtNzEzYi00ZjYzLTk5NWItNTZjZjg5NDA5ZWQ4IiwiZXZlbnRfaWQiOiIxYTVjODgzNy1iZTQ3LTRhMDAtYWNlZi1mZTdjNWYwODhjMDQiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNjg5OTI3NTUwLCJleHAiOjE2ODk5MzExNTAsImlhdCI6MTY4OTkyNzU1MCwianRpIjoiOTk3NGNjZDYtNTczZi00ZGNlLWJlNTYtYjdhNGNjMTdlMzg2IiwidXNlcm5hbWUiOiJudGNvbjEifQ.Gf0cDlOVH87g9Bbsa-_F7r5lnmsXX18Bce8zXnVru1qL82ymXGo5C1sY_paZvL6_mbV3KqZGx9SuEmvzQiqTpS02PxbkBoVPu26-K3AeM04ci5ZGEdgaVl3cMG8PU2bMPnqANc94lWFZq66qL94lIBaQfo-aVIHpT1hdONJAFVGjDwszO013qf5XZ1Kr9vUSAl1C8GC7oWYxcsb9eK540FbqxEwFhxAul7adY04tlyJgPpizVXNqTVyb1CNvpZUm7j7QBCtqdbZyNWJ0Gp9JGv15K8KiNrkqCD-WxYQATPiitXcCQatbL2yihI9AM2iWFugEqoemXMhXOkDsA5I6Pw",
 *    "shopValue3":"",
 *    "shopValue4":"",
 *    "shopValue5":"",
 *    "shopValue6":"",
 *    "shopValue7":""
 * }
 * */
