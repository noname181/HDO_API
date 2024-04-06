/**
 * Created by hdc on 2023-09-19
 * OCPP -> Request -> BE
 * 차징 리메인(배터리잔량) 정보 푸시
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { getKoreanDate, getFormatDateToMinutes, phoneFormatter } = require('../../util/common-util');
const { sendTalkAndLms } = require('../../util/sendTalkAndLmsUtil');
const { sendChgStrtMsgNon, sendChgStrtMsgMem } = require('../../util/notificationTalk/notificationTemplate');
const remoteStopTransaction = require("../../util/ocpp/remoteStopTransaction");

module.exports = {
  path: ['/charging-remain'],
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
    chg_id: _request.body.chg_id, // 충전기 인덱스 (int), Charger ID
    transId: _request.body.transId, // 트랜잭션 아이디, TransAction ID
    remain: _request.body.remain, // 그 충전기의 완충시까지 남은 시간(분)
    conn_id: 1
  };

  /*
  Example
  {
    "chg_id" : 2,
    "transId" : 124134134,
    "remain" : 26,
    "soc" : 43
  }
   */

  try {
    let res = {};
    let result = 'success';
    let msg = '';

    // 업데이트 하기 위한 충전건의 id를 확정한다.
    const targetChargingLogId = await models.sequelize.query(
      `
        SELECT cl_id
        FROM sb_charging_logs
        WHERE chg_id = :chg_id
        AND cl_transaction_id = :transId
        AND cl_stop_meter IS null
        `,
      {
        replacements: { chg_id: params?.chg_id, transId: params?.transId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log('remain clog id', targetChargingLogId);
    if (targetChargingLogId.length > 0) {
      // 대상 충전로그를 찾았다면 로직 진행
      const cl_id = targetChargingLogId[0]?.cl_id;

      // 처음 업데이트 되는 상황인지 판단하여, 충전 요청량과 예상 완료시간을 구한후 문자전송
      // 차징로그가 처음 업데이트 되는 상황인지 판단하는 여부는 remain값이 null 이였는지 판단.
      // 이 작업은 IC일때만 이루어지면 된다.(현장 선결제 상황)
      const clog = await models.sb_charging_log.findByPk(cl_id);
      console.log('!!! clog.remain : ', clog?.remain);

      if (clog?.remain && clog?.remain !== null && clog?.remain !== 0 && params?.remain == 0) {
        // 만약 진행중인 충전건의 직전 remainTime값이 0이 아니고, null도 아닌데
        // (최초 트랙잭션 시작후 정보갱신 딜레이 최대 30~40초를 지나온 유효한 데이터 발생 이후)
        // 새로 들어온 remain값이 0이라면 기계 및 차량의 비정상적 예외적 작동으로 판단하고
        // remoteStopTransAction을 전송하여 비정상 동작을 종료하고 충전완료 및 결제처리를 진행한다.
        const charger = await models.sb_charger.findOne({
          where: { chg_id: params?.chg_id },
          attributes: {
            exclude: ['deletedAt'],
          },
        });
        if (charger) {
          const charger_state = await models.sb_charger_state.findOne({
            where: { chg_id: params?.chg_id, cs_channel: params?.conn_id },
          });
          const vendorId = charger_state?.cs_vendor ?? '';
          const lastTransActionId = clog?.cl_transaction_id;
          const requestParameter = {
            cid: params?.chg_id,
            vendorId: vendorId,
            connId: params?.conn_id,
            transId: lastTransActionId,
          };
          const callResult = await remoteStopTransaction(requestParameter);
          console.log("!!!!! remainTime 0으로 인한 STOP", callResult)
          _response.json({
            result: 'success',
            msg: 'remainTime 0으로 인한 STOP.' + callResult?.toString(),
            resultCnt: 0,
          });
          return
        }
      }

      if (clog && clog?.cl_order_user_no.startsWith('IC') && clog?.remain === null && params?.remain != 0) {
        // 아직 제대로된 remain값이 업데이트되지 않아 remain이 null로 존재하는 상황.
        // 1. 결제된 금액에서 deposit을 뺀후 단가로 나누어 총 요청 kwh를 구한다.
        let authAmtCharge = clog?.authAmtCharge;
        if (!authAmtCharge) {
          const icPaymentNotification = await models.PaymentNotification.findOne({
            where: {
              order_no: clog?.order_no,
              auth_no: clog?.approval_number,
            },
            order: [['id', 'DESC']],
            limit: 1, // 1개만 선택
          });
          authAmtCharge = icPaymentNotification?.amount;
        }
        const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
        const depositRow = await models.Config.findOne({
          where: {
            divCode: DIV_CODE_DEPOSIT,
          },
        });
        // Todo 다시보니 remain은 여기서 잡아야 하는데, desiredKwh는 충전로그를 넣을때부터 알 수 있다. 필요시 수정할것
        const depositVal = depositRow?.cfgVal;
        const chargeCost = parseInt(authAmtCharge) - parseInt(depositVal);
        const unitPrice = parseInt(clog?.appliedUnitPrice);
        const icDesiredKwh = (chargeCost / unitPrice).toFixed(2);

        const date = getKoreanDate();
        const remainMinutes = parseInt(params?.remain);
        date.setMinutes(date.getMinutes() + remainMinutes);

        const dateString = getFormatDateToMinutes(date);
        const phoneString = phoneFormatter(process.env.SMS_NUM || '15515129');
        /** TODO 충전기 ID 넣어주세요, 그리고 회원 비회원을 나눠야합니다.  */
        let templateCode;
        let message;
        // 이걸 여기서 나눠봤자, IC가 없는 태그들은 이쪽으로 오지도 않음.
        // 비회원 알림톡
        let chargerId = '';
        const charger = await models.sb_charger.findByPk(clog?.chg_id)
        if (charger) {
          chargerId = charger?.chg_charger_id
        }
        ({ templateCode, message } = sendChgStrtMsgNon(chargerId, icDesiredKwh, dateString, phoneString));

        // Todo 문자 전송하기
        await sendTalkAndLms(clog?.receivePhoneNo, message, templateCode, clog?.chg_id);

        clog.remain = params?.remain;
        await clog.save();
        res = {
          result: 'success',
          msg: `총 1행 업데이트에 성공하였습니다.`,
          resultCnt: 1,
        };
        _response.json(res);
      } else if (clog && !clog?.cl_order_user_no.startsWith('IC') && clog?.remain === null && params?.remain != 0) {
        // 후불결제가 충전건이 처음 리메인 값을 받은 상황

        const date = getKoreanDate();
        const remainMinutes = parseInt(params?.remain);
        date.setMinutes(date.getMinutes() + remainMinutes);
        const dateString = getFormatDateToMinutes(date);
        const phoneString = phoneFormatter(process.env.SMS_NUM || '15515129');
        let chargerId = '';
        const charger = await models.sb_charger.findByPk(clog?.chg_id)
        if (charger) {
          chargerId = charger?.chg_charger_id
        }
        let templateCode;
        let message;
        // 맞춤형 요구량 텍스트
        let requested_kwh = '0';
        if (clog?.useType === 'PNC' || clog?.useType === 'RF') {
          requested_kwh = '충전 종료 시점시 사용'
        } else if (clog?.desired_kwh) {
          requested_kwh = ((clog.desired_kwh ?? 0) * 0.001).toFixed(2);
        } else if (clog?.desired_amt) {
          // if desired_amt = 500, appliedUnitPrice = 380 => 1.31578947 ...
          // requested_kwh should display 1.32
          requested_kwh = Math.ceil(clog.desired_amt / clog?.appliedUnitPrice * 100) / 100;
        } else if (clog?.desired_percent) {
          requested_kwh = `${clog?.desired_percent}% 도달시`
        }
        ({ templateCode, message } = sendChgStrtMsgMem(chargerId, requested_kwh, dateString, phoneString));
        await sendTalkAndLms(clog?.receivePhoneNo, message, templateCode, clog?.chg_id);
        clog.remain = params?.remain;
        await clog.save();

        res = {
          result: 'success',
          msg: `총 1행 업데이트에 성공하였습니다.`,
          resultCnt: 1,
        };
        _response.json(res);
      } else if (clog) {
        // 문자를 보내야 하는 상황이 아니면서 clog가 존재할때
        // 현장결제의 다른 상황일때도 이곳을 탐. params?.remain이 0이 아닐때만 업데이트를 해야함.
        if (params?.remain && params?.remain != 0) {
          clog.remain = params?.remain;
          await clog.save();
        }
        res = {
          result: 'success',
          msg: `총 1행 업데이트에 성공하였습니다.`,
          resultCnt: 1,
        };
        _response.json(res);
      }
    } else {
      // 자체 로직에 의해 차징로그를 업데이트 해주진 않기로 했지만 remain에 대한 요청은 와서
      // 응답은 해주기로 했을때
      _response.json({
        result: 'success',
        msg: '총 0행 업데이트에 성공하였습니다.',
        resultCnt: 0,
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
  _response.error.unknown(_error.toString());
  next(_error);
}
