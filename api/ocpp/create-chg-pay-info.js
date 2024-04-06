/**
 * Created by SeJin Kim on 2023-08-31
 * OCPP -> Request -> BE
 * 충전기 현장 결제 정보 등록
 * Register charger on-site payment information
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');

module.exports = {
  path: ['/chg-pay-info'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // Request
  const params = {
    chg_id: _request.body?.chg_id, // 충전기 인덱스 (int), Charger ID
    connector_id: _request.body?.connector_id ?? 1, // 커넥터 ID requried (Integer), Connector ID
    cardkey: _request.body?.cardkey, // 카드 번호 optional (String), Card Number
    // pretransnumber: _request.body?.pretransnumber, // 이값은 실제로 들어오지 않음
    ordernumber: _request.body?.ordernumber, // 주문번호ID 이게 원주문에 대한 고유값임
    approvalnumber: _request.body?.approvalnumber, // 승인번호ID optional (String), Approval ID
    paid_fee: _request.body?.paid_fee, // 결제 요금 required (Integer), Payment Charge
  };

  try {
    // 충전기 현장결제 정보 등록(sb_charge_local_ic_pay create)

    let res = {};
    let result = 'success';
    let msg = '';

    let applied_unit_price = 0
    let desired_kwh = 0

    // 결제정보를 등록할때, 결제정보연결이 이루어지지 않은 해당 충전기의 해당 커넥터에 대한 정보가 없다면 create, 있으면 update.
    const targetRow = await models.sb_charge_local_ic_pay.findOne({
      where: {
        chg_id: params?.chg_id,
        connector_id: params?.connector_id,
        payInfoYn: 'N'
      },
      order: [
        ['id', 'DESC']
      ],
      limit: 1,
    })

    let unitPrice = 0
    const charger = await models.sb_charger.findByPk(params?.chg_id)
    if ( charger ) {
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
      applied_unit_price = unitPrice
    }
    if (unitPrice) {
      desired_kwh = (params?.paid_fee / unitPrice).toFixed(2)
    }

    if (!targetRow) {
      // 대상을 찾지 못했을때, CREATE 로직 진행
      params["payInfoYn"] = "Y"
      params["autoRefundYn"] = "N"
      params["applied_unit_price"] = applied_unit_price
      params["desired_kwh"] = desired_kwh

      const createdInfo = await models.sb_charge_local_ic_pay.create(params);
      msg = '결제정보 등록에 성공하였습니다.';
      // 지금 인입된 주문번호와 승인번호로 노티를 찾을 수 있다면(노티가 더 빨랐다면)
      // 여기서 그냥 노티의 정보를 말아서 넣어버린다.
      const existNoti = await models.PaymentNotification.findOne({
        where: {
          order_no: params?.ordernumber,
          auth_no: params?.approvalnumber,
          noti_type: '10'
        },
        order: [['id', 'DESC']],
      })
      if (existNoti) {
        createdInfo.pg_cno = existNoti?.cno
        createdInfo.mall_id = existNoti?.memb_id
        existNoti.chg_id = createdInfo?.chg_id
        existNoti.connector_id = createdInfo?.connector_id
        existNoti.card_no = createdInfo?.cardkey
        existNoti.applied_unit_price = applied_unit_price
        existNoti.desired_kwh = desired_kwh
        await createdInfo.save()
        await existNoti.save()
      }

    } else {
      // 대상을 찾았을때, UPDATE 로직 진행.
      targetRow.chg_id = params?.chg_id
      targetRow.connector_id = params?.connector_id
      targetRow.cardkey = params?.cardkey
      targetRow.ordernumber = params?.ordernumber
      targetRow.approvalnumber = params?.approvalnumber
      targetRow.paid_fee = params?.paid_fee
      targetRow.payInfoYn = "Y"
      targetRow.autoRefundYn = "N"
      const existNoti = await models.PaymentNotification.findOne({
        where: {
          order_no: params?.ordernumber,
          auth_no: params?.approvalnumber,
          noti_type: '10'
        },
        order: [['id', 'DESC']],
      })
      if (existNoti) {
        targetRow.pg_cno = existNoti?.cno
        targetRow.mall_id = existNoti?.memb_id
        existNoti.chg_id = params?.chg_id
        existNoti.connector_id = params?.connector_id
        existNoti.phone = targetRow?.phone
        existNoti.card_no = params?.cardkey
        existNoti.applied_unit_price = applied_unit_price
        existNoti.desired_kwh = desired_kwh
        await existNoti.save()
      }
      await targetRow.save()
      msg = '결제정보 업데이트에 성공하였습니다.'
    }

    // Response (JSON format)  "result" : {}
    res['result'] = result;
    res['msg'] = msg;
    _response.json(res);
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
