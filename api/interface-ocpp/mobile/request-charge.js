/**
 * Created by Jackie Yoon on 2023-08-04.
 * 앱에서 CL 로그 생성 및 데이터 기록 요청
 */
'use strict';
const models = require('../../../models');
const sequelize = require('sequelize');
const remoteStartTransaction = require('../../../util/ocpp/remoteStartTransaction');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const moment = require('moment/moment');

module.exports = {
  path: ['/request-charge'],
  method: 'post',
  checkToken: true,
  roles: ['admin', 'mobile', 'biz'],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  /**
   * 유저아이디
   * 충전기인덱스
   * 충전기채널
   *
   * */
  const body = _request.body;
  const chg_id = body?.chg_id;
  const connId = body?.conn_id ?? 1;
  try {
    if (!chg_id) throw 'NEED_CHG_ID';
    const userId = body.userId ? body.userId : _request.user.id || _request.user.sub;

    const user = await models.UsersNew.findOne({
      where: { id: userId },
    });
    if (!user) throw 'NOT_EXIST_USER';

    // 충전선택 옵션 검증
    // 셋 중 하나만 0 이상, 나머지 2개는 0이 되어야 함
    if (!validateChargeRequest(body.request_kwh ?? 0, body.request_percent ?? 0, body.request_amt ?? 0)) {
      throw 'INVALID_CHARGE_REQUEST_OPTIONS';
    }

    // 충전기 고유 번호로 충전기 id를 조회
    const charger = await models.sb_charger.findOne({
      where: { chg_id: chg_id },
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!charger) throw 'NOT_EXIST_CHARGER';

    // sb_charger_state 조회
    const charger_state = await models.sb_charger_state.findOne({
      where: { chg_id: chg_id, cs_channel: connId },
    });
    if (charger_state?.cs_charging_state) {
      if (charger_state?.cs_charging_state === 'charging') {
        throw 'CHARGER_IS_CHARGING_NOW'
      } else if (charger_state?.cs_charging_state === 'finishing') {
        throw 'CHARGER_IS_FINISHING_NOW'
      }
    }
    const vendorId = charger_state?.cs_vendor ?? '';

    // idTag는 현재 로그인한 유저가 사용하기로한 rfCardNo다.
    // 추후 사용자가 많아졌을때 Join을 피하고 조회속도를 올리기위해,
    // 다른 테이블에 데이터가 저장되더라도 추가 컬럼에 추가 저장을 해주는 개념이다.
    // 앱으로 충전요청시 idTag가 아이폰은 없을수 있고, 안드로이드만 있다고해서 pk를 숫자로 만들어서 보내는걸로 바꿈.(2023.10.12)

    const idTag = user?.id ?? '';
    let kwh = body?.request_kwh ?? 0;
    let amount = body?.request_amt ?? 0;
    let targetSoc = body?.request_percent ?? 0;
    let unitPrice = 0;

    // 현시각 단가를 적용
    // 현재 로그인한 사용자 법인회원가가 적용되는 회원인지 먼저 판단한다.
    let isCorpDiscount = false;
    const orgId = user?.orgId;
    if (orgId) {
      const org = await models.Org.findByPk(orgId, {
      });
      const category = org?.category;
      // 소속을 코드에 따라 판단함.
      if (category && (category === 'BIZ' || category === 'ALLNC')) {
        isCorpDiscount = true;
      }
    }

    const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
    const DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';
    const DIV_CODE_CORP_DISC = 'CORP_DISC';
    const DIV_CODE_DEFAULT_UNITPRICE = 'DEFAULT_UNITPRICE';

    const [depositRow, memberDiscRow, corpDiscRow, defaultPriceRow] = await Promise.all([
      models.Config.findOne({
        where: {
          divCode: DIV_CODE_DEPOSIT,
        },
      }),
      models.Config.findOne({
        where: {
          divCode: DIV_CODE_MEMBER_DISC,
        },
      }),
      models.Config.findOne({
        where: {
          divCode: DIV_CODE_CORP_DISC,
        },
      }),
      models.Config.findOne({
        where: {
          divCode: DIV_CODE_DEFAULT_UNITPRICE,
        },
      }),
    ]);
    const depositVal = depositRow?.cfgVal;
    const memberDiscVal = memberDiscRow?.cfgVal;
    const corpDiscVal = corpDiscRow?.cfgVal;
    const defaultPrice = defaultPriceRow?.cfgVal;

    const priceSetAll = await models.UnitPriceSet.findAll();
    const nowHour = moment().tz('Asia/Seoul').hours();
    if (charger?.usePreset === 'Y') {
      const priceSet = priceSetAll.find(item => item.id === parseInt(charger?.upSetId) || 0);
      unitPrice = priceSet ? (priceSet[`unitPrice${nowHour + 1}`] ? priceSet[`unitPrice${nowHour + 1}`] : defaultPrice) : defaultPrice;
    } else if (charger?.usePreset === 'N') {
      unitPrice = charger.chg_unit_price ?? defaultPrice;
    }

    // 현재 앱에서 충전 요청은 일반회원 밖에 없으므로 기본 멤버 디스카운트를 적용(2024.01.11)
    unitPrice = unitPrice - memberDiscVal < 0 ? 0 : unitPrice - memberDiscVal

    // After business check logic, if charge should start, call function.
    /**
     * request parameter
     * cid – String 충전기 인덱스 (sb_chargers.chg_id)
     * vendorId – String 벤더 아이디  (고정값으로 받을것, sb_charger_status.cs_vendor -> 충전기 부팅시, 이값을 충전기가 가져감)
     * connId – int 커넥터 인덱스 (1, 2) ( 클린은 한개여서 1번, 듀얼일 경우 2개가 있을 수 있음, 3,4 개짜리는 못들어봄, 만약 둘이면 sb_charger_Status 가 둘이여야 함, cs_channel = 1, 충전기와 1:N )
     * idTag – String (멤버쉽 카드 번호)
     * kwh – int 요청 충전용량 (필수, 내용이 없어도 0을 전달)
     * amount – int 결제금액  (필수, 내용이 없어도 0을 전달)
     * unitPrice – int 단가 (필수, 내용이 없어도 0을 전달)
     * targetSoc - 목표 충전률 (옵션, 내용이 없어도 0을 전달)
     */
    /**
     * response
     * JSON 성공시 : {"result":"000", "msg": ""}, 실패시 : {"result":"999", "msg": "이유"}
     */

    // 충전 요청이 성공하든 실패하든 이 요청건을 기록으로 백엔드 DB에 저장해놓는다.
    const chargeRequestInput = {
      chg_id: chg_id,
      conn_id: connId,
      card_id: body?.card_id,
      request_kwh: kwh * 1000,
      request_percent: targetSoc,
      request_amt: amount,
      userId: userId,
    };

    const chargeRequest = await models.sb_charge_request.create(chargeRequestInput);
    await chargeRequest.save();

    // 충전 요청할때 kwh기준으로 유효성검사해서 날린다고 해도,
    // targetSoc나 amount를 0으로 놓고 요청하면 충전기는 OR로
    // 이 조건들을 타기 때문에 해당 조건이 되면 바로 꺼져 버림.
    // 때문에 targetSoc를 기준으로 요청한 요청이 아니라고해도, targetSoc는 기본값으로 80이 설정되어 날아와야함.

    if (targetSoc && targetSoc > 0 ) {
      // 충전률로 요청이 왔다면 나머지는 모두 도달 불가능한 맥스값을 준다.
      kwh = 500 * 1000 // 충전기에선 wh단위로 처리하는듯
      amount = 500 * unitPrice // 500kwh정도면 어지간해서 도달하지 않는 최대kwh라고 한다.
    } else {
      // 충전률이 아닌 요청이 왔다면
      if (kwh > 0 && amount > 0) {
        // 둘다 날아 왔을때
        targetSoc = 80
        if (unitPrice > 0) {
          amount = kwh * unitPrice
        } else {
          amount = 300000
        }
        kwh = kwh * 1000
      }
      else if (amount > 0) {
        // 둘다 0보다 크진 않은데 금액은 0보다 큰 경우
        targetSoc = 80
        if (unitPrice > 0) {
          kwh = (amount / unitPrice) * 1000
        } else {
          kwh = 999 * 1000
        }
      }
      else if (kwh > 0) {
        // 둘다 0보다 크진 않은데 kwh는 0보다 큰 경우
        targetSoc = 80
        if (unitPrice > 0) {
          amount = kwh * unitPrice
        } else {
          amount = 300000
        }
        kwh = kwh * 1000
      }
    }

    const requestParameter = {
      cid: chg_id,
      vendorId: vendorId,
      connId: connId,
      idTag: `RS${idTag}`,
      kwh: Math.trunc(kwh/10)*10,
      amount: amount,
      unitPrice: unitPrice,
      targetSoc: targetSoc,
    };
    console.log('!!! 호출전 requestParameter', requestParameter);
    // 함수호출하는데 formData로 쏴야함.
    const callResult = await remoteStartTransaction(requestParameter);
    console.log("!!!!! callResult START", callResult)

    if (callResult?.result && callResult?.result.toString() === '000') {
      _response.json({
        result: '000',
        msg: callResult?.msg ?? 'success',
      });
    } else {
      _response.json({
        result: '999',
        msg: callResult?.msg ?? 'fail',
      });
    }
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error.toString());
  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '충전기 정보를 찾을 수 없습니다.');
    return;
  }

  if (_error === 'INVALID_CHARGE_REQUEST_OPTIONS') {
    _response.error.badRequest(_error, '충전율, 충전량, 충전금액 중 1가지 옵션만 선택 가능합니다.');
    return;
  }

  if (_error === 'NEED_CHG_ID') {
    _response.error.badRequest(_error, '충전기 아이디(인덱스)가 누락되었습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_USER') {
    _response.error.badRequest(_error, '사용자(userId)를 찾을 수 없습니다..');
    return;
  }
  if (_error === 'CHARGER_IS_CHARGING_NOW') {
    _response.error.badRequest(_error, '현재 충전중인 충전기 입니다.');
    return;
  }
  if (_error === 'CHARGER_IS_FINISHING_NOW') {
    _response.error.badRequest(_error, '현재 출차 대기중인 충전기입니다. 커넥터를 해제해 주세요.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

// function validateChargeRequest(desired_percent, desired_kwh, desired_amt) {
//   const countNonZero = [desired_percent, desired_kwh, desired_amt].reduce(
//     (count, value) => count + (value > 0 ? 1 : 0),
//     0
//   );
//   return countNonZero === 1 && desired_percent >= 0 && desired_kwh >= 0 && desired_amt >= 0;
// }

function validateChargeRequest(request_kwh, request_percent, request_amt) {
  const variables = [request_kwh, request_percent, request_amt];
  const nonZeroCount = variables.filter(value => value > 0).length;

  if (nonZeroCount === 1) {
    if (
      Number.isInteger(request_kwh) &&
      Number.isInteger(request_percent) &&
      Number.isInteger(request_amt)
    ) {
      return true;  
    } else {
      return false;  
    }
  } else {
    return false;  
  }
}
