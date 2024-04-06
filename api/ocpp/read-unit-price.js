/**
 * Created by SeJin Kim on 2023-08-31
 * Implemented by HDC on 2023-09-12

 * 충전기가 충전을 시작할때 단가 정보를 요청하는데
 * 회원단가, 비회원단가, 출차보증금 리턴하면된다.
 * 시간단위가 있다고하니, 요청받은 시간에 맞는 금액을 리턴하면된다.
 * 보통은 현장결제할때 화면에 표시하는용으로 쓴다고한다.
 *
 * OCPP -> Request -> BE
 * 충전 시작전 현시간 단가 요청
 * Unit price request for the current time before charging starts
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const moment = require('moment');

module.exports = {
  path: ['/ocpp-unit-price'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // Request
  const chg_id = _request?.body?.chg_id;
  if (isNaN(chg_id)) {
    _response.json({
      result: 'fail',
      message: '충전기 인덱스가 올바르지 않습니다.',
    });
    return;
  }
  /*
        unitpricesets 테이블
        sb_chargers 테이블
        foreign_key = upSetId
    */

  try {
    // 충전기 인덱스를 이용한 단가리턴(현시각)
    // 시간대에 따른 컬럼명 확정
    const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
    const DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';
    const DIV_CODE_DEFAULT_UNITPRICE = 'DEFAULT_UNITPRICE';
    const DIV_CODE_CORP_DISC = 'CORP_DISC'

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
    let unitPrice = defaultPrice;

    const charger = await models.sb_charger.findOne({
      where: { chg_id: chg_id },
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!charger) throw 'NOT_EXIST_CHARGER';

    // 기본단가 결정
    if (charger?.usePreset === 'N') {
      // 단가 프리셋을 사용하지 않는 경우
      if (charger?.chg_unit_price) {
        // 단가 프리셋을 사용하지 않는데 고정단가가 설정된 경우
        unitPrice = charger?.chg_unit_price
      }
    } else if (charger?.usePreset === 'Y') {
      // 단가 프리셋을 사용하는 경우
      const upSetId = parseInt(charger?.upSetId) || 0;
      if (upSetId !== 0) {
        // 단가 프리셋 옵션이 켜져있고, 실제로 단가프리셋 지정도 되어 있는 경우
        const priceSet = await models.UnitPriceSet.findOne({
          where: {
            id: upSetId,
          },
        });
        if (priceSet) {
          // 실제로 단가 프리셋을 찾은 경우
          const currentHours = moment().tz('Asia/Seoul').hours() + 1;
          unitPrice = priceSet[`unitPrice${currentHours}`]
        }
      }
    }

    // 할인적용


    /*  Response
          nonmember_price : 비회원 단가
          member_price : 회원 단가
          deposit : 출차 보증금
      */
    const resData = {
      nonmember_price: unitPrice,
      member_price: unitPrice - memberDiscVal,
      corp_price: unitPrice - corpDiscVal,
      deposit: depositVal,
    };
    _response.json({
      result: resData,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '충전기 정보를 찾을 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
