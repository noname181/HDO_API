'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { payRequestFromKICC } = require('../../util/paymentUtil');
const moment = require('moment');

module.exports = {
  path: '/afterAction/paid',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const cl_id = body?.cl_id;
  const card_id = body?.card_id;
  const requestedUser = await models.UsersNew.findOne({
    where: {
      id: _request.user.id || _request.user.sub,
    },
  });
  let paidUserId = body?.paidUserId;
  try {
    if (!paidUserId) {
      const requestedUser = await models.UsersNew.findOne({
        where: {
          id: _request.user.id || _request.user.sub,
        },
      });
      paidUserId = requestedUser?.id;
    }
    if (!cl_id) throw 'CL_ID_NEEDED';
    const clog = await models.sb_charging_log.findByPk(cl_id);
    if (!clog) throw 'NOT_EXIST_CHARGING_LOG';
    if (clog?.payCompletedYn === 'Y') throw 'ALREADY_PAY_COMPLETED';
    if (clog?.afterAction === 'COST' || clog?.afterAction === 'PAID') {
      throw 'ALREADY_AFTER_ACTION_COMPLETED';
    }

    // 얼마를 결제처리 해줘야하는지 구한다.
    let expectedAmt = clog?.expectedAmt;
    if (!expectedAmt) {
      const calculatedAmt = Math.floor(clog?.appliedUnitPrice * clog?.cl_kwh * 0.001);
      expectedAmt = calculatedAmt;
      // desired_amt가 0보다 클 경우, 희망금액 유형의 충전이라고 보고
      // 희망금액 유형의 충전이라면 그 희망금액보다 큰 금액이 계산되었다면 잘라준다.
      if (clog?.desired_amt) {
        expectedAmt = calculatedAmt > clog.desired_amt ? clog?.desired_amt : calculatedAmt;
      }
    }

    // 결제 (재결제 플래그 넣어줌)
    const card = await models.BankCard.findByPk(card_id, {});
    if (!card) throw 'NOT_FOUND_CARD_INFO';

    // 해당 카드의 id로 카드의 빌링키를 찾음.
    const billingKey = card?.billingKey;
    if (!billingKey) throw 'NOT_FOUND_BILLING_KEY';

    const charger = await models.sb_charger.findByPk(clog?.chg_id);
    const payMallId = charger?.mall_id2;

    if (expectedAmt > 10) {
      // 결제를 발생시킬 수 있는 금액인 경우
      const paymentResult = await payRequestFromKICC(expectedAmt, billingKey, payMallId, true, cl_id);

      // * LOG KICC data
      try {
        const cardLogData = {
          url: _request.url,
          content: paymentResult,
          userId: _request.user.id,
        };
        console.log('pay method approval::service::store log::success', paymentResult);
        await models.AllLogs.create(cardLogData);
      } catch (err) {
        console.log('pay method approval::service::store log::err', err);
      }

      if (paymentResult?.resCd === '0000') {
        // 결제 성공
        clog.authDate = moment().format('YYYY-MM-DD HH:mm:ss');
        clog.payCompletedYn = 'Y';
        // 결제처리에 대한 내역을 저장한다.
        const paidInput = {
          cl_id: clog?.cl_id,
          afterAction: 'PAID',
          paidUserId: paidUserId,
          amount: expectedAmt,
        };
        const paidActionResult = await models.sb_charging_pay_fail_after_action.create(paidInput);
        // 충전건에 해당 처리에 대한 데이터들을 업데이트 한다.
        const paidKwh = Math.floor((expectedAmt / clog?.appliedUnitPrice) * 1000);
        clog.ignored_kwh = clog.cl_kwh - paidKwh < 0 ? 0 : clog.cl_kwh - paidKwh;
        clog.afterAction = 'PAID';
        clog.afterPaidAmt = expectedAmt;
        clog.payCompletedYn = 'Y';
        await clog.save();
        _response.json({
          status: '200',
          result: {
            result: 'success',
            resCd: paymentResult?.resCd,
            resMsg: '결제에 성공하였습니다.',
          },
        });
        return;
      } else {
        // 재결제 실패
        _response.json({
          status: '200',
          result: {
            result: 'fail',
            resCd: paymentResult?.resCd,
            resMsg: paymentResult?.resMsg,
          },
        });
        return;
      }
    }
    // 결제금액이 10원 미만이라 그냥 잡손실 처리하는 경우
    clog.ignored_kwh = clog.cl_kwh;
    clog.afterAction = 'PAID';
    clog.payCompletedYn = 'Y';
    _response.json({
      status: '200',
      result: {
        result: 'success',
        resCd: 'Under10',
        resMsg: '10원미만의 금액이라 재결제를 진행하지 않았습니다.',
      },
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

  if (_error === 'CL_ID_NEEDED') {
    _response.error.badRequest(_error, '충전로그 ID가 필요합니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGING_LOG') {
    _response.error.notFound(_error, '충전로그를 찾을 수 없습니다.');
    return;
  }

  if (_error === 'NOT_FOUND_CARD_INFO') {
    _response.error.notFound(_error, '카드 정보를 찾을 수 없습니다.');
    return;
  }

  if (_error === 'NOT_FOUND_BILLING_KEY') {
    _response.error.notFound(_error, '빌링키 정보를 찾을 수 없습니다.');
    return;
  }

  if (_error === 'ALREADY_PAY_COMPLETED') {
    _response.error.badRequest(_error, '이미 완료된 결제건 입니다.');
    return;
  }
  if (_error === 'ALREADY_AFTER_ACTION_COMPLETED') {
    _response.error.badRequest(_error, '이미 잡손실 처리 또는 재결제 완료된 결제건 입니다.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
