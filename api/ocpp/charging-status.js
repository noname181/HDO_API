/**
 * Created by hdc on 2023-09-22
 * OCPP -> Request -> BE
 * 충전기의 커넥션 상태가 변할때마다 요청 들어옴.
 * 특별히 뭔가를 할 필요는 없고, 필요시 로직 작성의 시점을 잡는데 활용하면 된다.
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const moment = require('moment/moment');
const axios = require('axios');
const crypto = require('crypto');
const {
  payRequestFromKICC,
  refundRequestFromKICC,
  refundALLRequestFromKICC,
  createTransactionID,
  formatDate,
  getMsgAuthValue,
} = require('../../util/paymentUtil');
const { Op } = require('sequelize');
const cryptor = require('../../util/cryptor');
const { getKoreanDate, getFormatDateToMinutes, priceToString, phoneFormatter } = require('../../util/common-util');
const { sendLms } = require('../../util/sendLmsUtil');
const { sendTalkAndLms } = require('../../util/sendTalkAndLmsUtil');
const {
  sendRefundMsg,
  sendComChgMsg,
  sendComChgMsgMem,
  sendChgHisMsg,
  sendPartCancelFailedMsg,
} = require('../../util/notificationTalk/notificationTemplate');
const sendUnitPricePending = require('../../controllers/webAdminControllers/ocpp/sendUnitPricePending');
const sendCurrentUnitPrice = require('../../controllers/webAdminControllers/ocpp/sendCurrentUnitPrice');
const { LOG_LEVEL } = require('../../controllers/webAdminControllers/logControllers/logType.enum');

module.exports = {
  path: ['/charging-status'],
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
    chg_id: _request.body?.chg_id, // 충전기 아이디
    conn_id: _request.body?.conn_id ?? 1, // 충전기채널, 커넥터아이디
    trans_id: _request.body?.trans_id, // 트랜잭션 아이디(차징로그와 연결)
    old_status: _request.body?.old_status, // 예전 상태
    new_status: _request.body?.new_status, // 지금 상태
    idTag: _request.body?.idTag,
  };

  let msg = '';

  // 현재 진행중인 차징로그를 추려본다.
  const clog = await models.sb_charging_log.findOne({
    where: {
      [Op.and]: [
        {
          chg_id: {
            [Op.eq]: params?.chg_id,
          },
        },
        {
          cl_channel: {
            [Op.eq]: params?.conn_id,
          },
        },
        {
          cl_transaction_id: {
            [Op.eq]: params?.trans_id,
          },
        },
      ],
    },
    order: [['cl_id', 'DESC']],
  });

  const isStopMeterExist = clog?.cl_stop_meter;
  const old_status = params?.old_status?.toLowerCase();
  const new_status = params?.new_status?.toLowerCase();
  try {
    /**
     * 10.31 테스트시 발생한 예외상황에 대한문제
     * availabe -> 현장결제정보입력 -> 실결제 발생 -> 커넥터연결
     * -> preparing으로 변경
     * -> 오랫동안 charging으로 이어지지 않음
     * -> 타임오버로 다시 available로 변경
     * -> 돈만 결제되고, 충전기록이 존재하지 않는 상황
     *
     * 프리페어링에서 어베일로 바꼈을때, 그 충전기의 마지막 결제가 충전로그와 연결되지 않았다면 결제 취소를 한다.
     *
     *
     */

    // 충전기가 이용가능 상태가 되면, 대기중인 가장 최신의 단가변경건을 전송한다.
    if (old_status !== 'available' && new_status === 'available') {
      const pendingUnitPrice = await models.sb_unitprice_change_pending.findOne({
        where: {
          chg_id: params?.chg_id,
          isSent: false,
        },
        order: [['ucp_id', 'DESC']],
      });
      if (pendingUnitPrice) {
        // 단가 전송을 시도한다.
        const sendResult = await sendUnitPricePending(pendingUnitPrice);
        if (sendResult === 'SEND') {
          console.log('단가 전송 성공');
        } else if (sendResult === 'SEND_FAIL') {
          console.log('단가 전송 실패');
        } else if (sendResult === 'NO_CHARGER') {
          console.log('충전기를 찾지 못해 단가 전송안함');
        }
      } else {
        // 충전기는 이용가능 상태가 될때마다, 만약 member_disc의 값이 달라졌다면 그것을 반영하여 단가를 다시 내려줄 수 있어야 한다.
        // 하지만 이 정보는 일반적인 단가예약이나 대기 정보와 다르게 단가를 어떻게 설정하기로 되어있었는지등의 정보를 모른다.
        // 그냥 최종적으로 업데이트된 단가 정보를 이용해서 할인금액만 갱신해줄 수 있을 뿐이다.
        // 그렇다면 여기서 변수로 사용할 수 있는 조건은
        // 1. 마지막으로 MEMBER_DISC가 변경된 시점이 언제인지
        // 2. 해당 차저가 단가를 최종적으로 갱신해간 시점이 언제인지
        // 이 두가지 조건을 이용하여 단가를 적용해가지 않았다고 판단되는 charger라면 해당 charger가 가진 최종 단가를 이용하여
        // 회원할인금액을 다시 적용하여 전송을 해줘야 한다.
        // 위에서 sendUnitPricePending으로 대기중이였던 최종 단가를 보내주었다면 이게 실행될 필요가 없다.
        // 충전기가 단가정보를 내려받는 순간은 처음 부팅시,
        // 그리고 상태가 available이 아니였다가, available로 바뀔때 대기중인 변경건이 전송될때이다.
        // 이 두가지 시점에 lastConfigAppliedAt 라는 시간컬럼을 업데이트 해준다면,
        // 이 조건문에 들어왔을때 단가와 할인정보를 새로 보내줘야 하는지 판단이 가능하다.
        // 추후에 미출차보증금, 법인할인등의 개념이 추가되더라도 해당 Config값중 가장 최신에 업데이트된 컬럼의 날짜를 기준으로 갱신해주면 된다.

        // 1. 반영해야할 가장 최신의 Config컬럼을 확정한다. 현재 회원할인만 적용되었음.
        const DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';
        const [config] = await Promise.all([models.Config.findOne({ where: { divCode: DIV_CODE_MEMBER_DISC } })]);
        const lastConfigUpdated = config?.updatedAt;

        // 2. 현재 충전기의 단가재발송 필요성을 판단한다.
        const charger = await models.sb_charger.findOne({
          where: {
            chg_id: params.chg_id,
          },
        });
        if (charger) {
          const lastConfigAppliedAt = charger?.lastConfigAppliedAt;
          if (lastConfigAppliedAt < lastConfigUpdated) {
            // 만약 설정 마지막 적용시점이 마지막 설정업데이트 일자보다 이전이라면 최신 설정 적용하여 단가전송
            const sendResult = await sendCurrentUnitPrice(charger?.chg_id);
            if (sendResult === 'SEND') {
              console.log('설정정보 업데이트한 단가 전송 성공');
            } else if (sendResult === 'SEND_FAIL') {
              console.log('설정정보 업데이트한 단가 전송 실패');
            } else if (sendResult === 'NO_CHARGER') {
              console.log('충전기를 찾지 못해 설정정보 업데이트한 단가 전송안함');
            }
          }
        }
      }
    }

    // 현장결제시 충전상태로 들어가지 못했을때 결제취소 자동처리
    if (old_status === 'preparing' && new_status === 'available') {
      if (clog?.payCompletedYn === 'Y') {
        // 만약 clog를 찾는데 성공했고, 결제프로세스도 완료된 건이라면 스킵.
        msg = `이미 결제프로세스 완료된 충전건 입니다. ${clog?.reason}`;
        return;
      }
      // chg_id
      // 현장결제 정보를 토대로 현재 충전기에서 진행했던 마지막 결제의 승인번호와 주문번호를 찾음.
      const local_pay_log = await models.sb_charge_local_ic_pay.findOne({
        where: { chg_id: params?.chg_id, connector_id: params?.conn_id },
        order: [['id', 'DESC']],
      });
      if (local_pay_log) {
        const order_no = local_pay_log.ordernumber;
        const approvalnumber = local_pay_log.approvalnumber;
        // 해당 값을 가진 charging_log를 찾는다.
        // 만약 charging_log에 이 값을 물고 있는게 없다면 이값을 가진 노티를 찾아 취소해야 한다.
        const existClog = await models.sb_charging_log.findOne({
          where: { order_no: order_no, approval_number: approvalnumber },
        });
        if (!existClog) {
          // 노티를 다시 찾아서 그 노티를 취소한다.
          const cancelNoti = await models.PaymentNotification.findOne({
            where: { order_no: order_no, auth_no: approvalnumber, noti_type: '10' },
            order: [['id', 'DESC']],
          });
          const cancelMallId = cancelNoti?.memb_id;
          const cancelPgCno = cancelNoti?.cno;
          let isRefundRequestSuccess = false;
          const refundResult = await refundALLRequestFromKICC(cancelPgCno, cancelMallId);

          try {
            const logData = {
              url: _request.url,
              content: refundResult,
              userId: clog?.userId,
            };
            console.log('charging-status::service::store log::success', logData);
            await models.AllLogs.create(logData);
          } catch (err) {
            console.log('charging-status::service::store log::err', err);
          }

          /*
          {
            "resCd": "0000",
            "resMsg": "정상취소",
            "mallId": "05574880",
            "shopTransactionId": "refund-231106-tr-1699278319292",
            "shopOrderNo": "order-refund-231106-tr-1699276618829",
            "oriPgCno": "23110622165810894701",
            "cancelPgCno": "23110622451910952636",
            "transactionDate": "20231106224519",
            "cancelAmount": 1441,
            "remainAmount": 0,
            "statusCode": "TS02",
            "statusMessage": "승인취소",
            "escrowUsed": "N",
            "reviseInfo": {
            "payMethodTypeCode": "11",
              "approvalNo": "",
              "approvalDate": "20231106224519",
              "cardInfo": {
              "couponAmount": 0
            },
            "refundInfo": {
              "refundDate": "",
                "depositPgCno": ""
            },
            "cashReceiptInfo": {
              "resCd": "",
                "resMsg": "",
                "approvalNo": "",
                "cancelDate": ""
            }
          }
          }
           */

          if (refundResult?.resCd === '0000') {
            // 결제 성공
            isRefundRequestSuccess = true;
          }
          if (isRefundRequestSuccess) {
            await models.RequestRefund.create({
              div_code: 'ETC',
              refund_reason: '충전 미시작으로 인한 자동취소',
              noti_id: cancelNoti?.id,
              oriPgCno: refundResult?.oriPgCno,
              cancelPgCno: refundResult?.cancelPgCno,
              statusCode: refundResult?.statusCode,
              cancelAmount: refundResult?.cancelAmount,
            });
            // TODO 취소 성공 시 2lvl 알림 전송
            const sendRefundData = sendRefundMsg(refundResult?.cancelAmount);

            // const autoCancelMsg = `[EV&U] 자동 취소 안내.
            //
            // 충전 미시작으로 인해 ${refundResult?.cancelAmount}원 취소 되었습니다.
            //
            // -HD현대오일뱅크-
            // `

            // Todo 문자 전송하기
            // 차징로그가 쌓이지도 않았기 때문에 차징로그의 전화번호가 없다.
            const chg_id = params?.chg_id;
            const conn_id = params?.conn_id;
            const local_log = await models.sb_charge_local_ic_pay.findOne({
              where: { chg_id: chg_id, connector_id: conn_id },
              order: [['id', 'DESC']],
            });
            if (local_log) {
              await sendTalkAndLms(local_log?.phone, sendRefundData?.message, sendRefundData?.templateCode, chg_id);
              local_log.autoRefundYn = 'Y';
              await local_log.save();
            }
            return;
          } else {
            return;
          }
        }
      }
    }

    // 현장결제 충전완료 메시지 안내
    // if (old_status === "charging" && new_status === "finishing" && clog?.cl_order_user_no.startsWith("IC")) {
    if (old_status === 'charging' && new_status === 'finishing') {
      if (clog?.payCompletedYn === 'Y') {
        msg = `이미 결제프로세스 완료된 충전건 입니다. ${clog?.reason}`;
        return;
      }
      const stopDate = getKoreanDate();
      const dateString = getFormatDateToMinutes(stopDate);
      const originalKwh = clog?.cl_stop_meter - clog?.cl_start_meter ?? clog?.cl_kwh;
      const originalFee = Math.floor((originalKwh ?? 0) * clog?.appliedUnitPrice * 0.001);
      let adjustedKwh;
      // desired_kwh값이 존재할 경우 잡손실처리후 보정kwh로 안내
      if (clog?.desired_kwh && parseFloat(originalKwh) > parseFloat(clog?.desired_kwh)) {
        // 현장이든, 앱이든 사용량이 desired_kwh보다 큰 경우는 깎아서 적용 시키는게 맞다.
        clog.ignored_kwh = originalKwh - clog?.desired_kwh;
        adjustedKwh = clog?.desired_kwh;
      } else if (clog?.desired_amt && originalFee > clog?.desired_amt) {
        // 희망금액 기준으로 오바되도 깎아준다.
        let adjustedKwhFromAmt = Math.ceil((clog?.desired_amt / clog?.appliedUnitPrice) * 1000);
        clog.ignored_kwh = originalKwh - adjustedKwhFromAmt;
        adjustedKwh = adjustedKwhFromAmt;
      } else {
        adjustedKwh = originalKwh;
      }
      // adjustedKwh = parseFloat(originalKwh) > parseFloat(clog?.desired_kwh) ? clog?.desired_kwh : originalKwh
      const totalKwh = (adjustedKwh * 0.001).toFixed(2);
      const originalKwhToFixed = (adjustedKwh * 0.001).toFixed(2);

      // 여기서 이미 최초 원했던량보다 더했다면 최초 원했던량까지 줄여야함
      const appliedPrice = clog?.appliedUnitPrice;
      let fee = (originalKwh ?? 0) * clog?.appliedUnitPrice * 0.001;
      if (clog?.desired_amt && fee >= clog?.desired_amt) {
        fee = clog?.desired_amt;
      } else if (clog?.desired_kwh) {
        // 만약 희망 충전량이 있었다면 실사용량의 와트가 아니라 적응형 와트로 금액을 계산
        fee = Math.floor((adjustedKwh ?? 0) * clog?.appliedUnitPrice * 0.001);
      } else if (clog?.useType === 'CREDIT' && fee > clog?.authAmtCharge) {
        // 현장결제의 경우 선결제금액보다 큰 금액이라면 깎아준다.
        fee = clog?.authAmtCharge;
      } else {
        fee = Math.floor(fee);
      }
      const feeString = priceToString(fee);

      // 현장결제, 회원결제 나누는건 여기서 해야한다.
      if (clog?.cl_order_user_no.startsWith('IC')) {
        const sendComeChgMsgData = sendComChgMsg(dateString, originalKwhToFixed, appliedPrice, feeString);
        await sendTalkAndLms(
          clog?.receivePhoneNo,
          sendComeChgMsgData?.message,
          sendComeChgMsgData?.templateCode,
          clog?.chg_id
        );
      } else {
        const sendComeChgMsgMemData = sendComChgMsgMem(dateString, originalKwhToFixed, appliedPrice, feeString);
        await sendTalkAndLms(
          clog?.receivePhoneNo,
          sendComeChgMsgMemData?.message,
          sendComeChgMsgMemData?.templateCode,
          clog?.chg_id
        );
      }
    }

    // 계산되는 시점
    if (
      (old_status === 'finishing' && new_status === 'available') ||
      (isStopMeterExist && new_status === 'available')
    ) {
      // console.log("계산이 일어나야 한다.")
      // 차징로그 언플러그드 시킴.
      const clog = await models.sb_charging_log.findOne({
        where: {
          cl_transaction_id: params?.trans_id,
          chg_id: params?.chg_id,
        },
        order: [['cl_id', 'DESC']],
        limit: 1,
      });

      clog.cl_unplug_datetime = moment().format('YYYY-MM-DD HH:mm:ss');
      await clog.save();
      const cl_id = clog?.cl_id;

      // 2023.12.06 기타종료로 인한 충전종료시 이곳에 중복해서 들어올수 있다.
      // 기타종료로 인한 충전종료시 해당 충전건에 대한 부분취소, 후불결제등 대부분의 작업을 마무리짓기 때문에
      // 중복해서 결제로직을 탈 필요가 없다.
      // 해당 케이스에선 payCompletedYn이 Y로 변경 될 것이기 때문에 해당 플래그로 이 부분 로직을 태울지 말지 결정한다.
      if (clog?.payCompletedYn === 'Y') {
        msg = `이미 결제프로세스 완료된 충전건 입니다. ${clog?.reason}`;
        return;
      }

      // 얼마 결제해야하나 계산

      // 현장결제의 경우 (선결제금액 - 실이용금액 - 미출차요금 부분취소 결제를 요청)
      if (clog?.cl_order_user_no.startsWith('IC')) {
        const prePaidCharge = clog?.authAmtCharge; // 선결제금액
        const prePaidChargeString = priceToString(prePaidCharge);

        console.log('!!! reason : ', clog?.reason?.toLowerCase());
        // Todo 이 조건문에 못들어오는듯 ( 자동종료 상황에서 - 11.14 )
        // if (clog?.reason && clog?.reason?.toLowerCase() == 'other') {
        //   // 사용측정량이 최초희망량보다 크면 최초희망량으로 보정
        //   if (usedKwh > clog?.desired_kwh) {
        //     clog.ignored_kwh = usedKwh - clog?.desired_kwh
        //     usedKwh = clog?.desired_kwh
        //   }
        // }

        // 현장결제도 금액 계산 부분 수정

        let usedKwh = parseInt(clog?.cl_stop_meter) - parseInt(clog?.cl_start_meter) ?? clog?.cl_kwh;
        const usedKwhString = (usedKwh * 0.001).toFixed(2);

        let adjustedKwh;
        if (parseFloat(usedKwh) > parseFloat(clog?.desired_kwh)) {
          clog.ignored_kwh = usedKwh - clog?.desired_kwh;
          adjustedKwh = clog?.desired_kwh;
        } else {
          adjustedKwh = usedKwh;
        }
        const adjustedKwhString = (adjustedKwh * 0.001).toFixed(2);
        const chargeFee = Math.ceil((adjustedKwh ?? 0) * clog?.appliedUnitPrice * 0.001);
        clog.chargeFee = chargeFee;
        const chargeFeeString = priceToString(chargeFee);

        let refundAmt = prePaidCharge - chargeFee;
        if (refundAmt <= 0) {
          refundAmt = 0;
        }
        const actualPaidAmt = prePaidCharge - refundAmt;
        const actualPaidAmtString = priceToString(actualPaidAmt);
        const refundAmtString = priceToString(refundAmt);
        const unplugDate = getKoreanDate();
        const unplugDateString = getFormatDateToMinutes(unplugDate);
        const phoneString = phoneFormatter(process.env.SMS_NUM || '15515129');

        // 미출차 (PARK_ALLOW_MIN) 관련 로직은 추후에 다시 계산해서 적용할 것.(2023-10-14)
        if (refundAmt === 0) {
          // 미출차 보증금과 선결제 보증금등을 따로 설정하지 않으면 이쪽 로직을 탈 가능성이 있음.
          // 이경우에도 고객에게 결과에 대한 알림은 보내야함
          // 부분취소 함수를 호출하지 않더라도 결과에 대한 메시지는 전송되어야함.

          const sendChgHisMsgZero = sendChgHisMsg(
            prePaidChargeString,
            adjustedKwhString,
            clog?.appliedUnitPrice,
            chargeFeeString,
            unplugDateString,
            refundAmtString,
            actualPaidAmtString,
            phoneString
          );

          // const icResultMessage = `[EV&U] 충전 결제 내역 입니다.
          //
          // [선결제 내역]
          // 충전 금액 : ${prePaidChargeString}원
          //
          // [충전 내역]
          // 총 충전량 : ${usedKwhString}kWh
          // 충전 단가 : ${clog?.appliedUnitPrice}원
          // 충전 금액 : ${chargeFeeString} 원
          // 충전 완료 : ${unplugDateString}
          //
          // [결제 내역]
          // 취소 금액 : ${refundAmtString} 원
          // 최종 결제 금액 : ${actualPaidAmtString} 원
          //
          // 취소금액은 카드사에 따라 2~3 영업일 이후에 한도에 반영될수도 있습니다.
          //
          // 다른 고객의 충전을 충전을 위하여 차량을 이동해주세요.
          //
          // 고객센터 ${phoneString}
          //
          // -HD현대오일뱅크-`;

          // Todo 문자 전송하기
          await sendTalkAndLms(
            clog?.receivePhoneNo,
            sendChgHisMsgZero?.message,
            sendChgHisMsgZero?.templateCode,
            clog?.chg_id
          );
          msg = '취소 금액이 0원이므로 취소 요청을 하지 않았습니다.';
          clog.payCompletedYn = 'Y';
          await clog.save();
        } else {
          // 결제 취소 진행
          let isRefundRequestSuccess = false;

          const icPaymentNotification = await models.PaymentNotification.findOne({
            where: {
              order_no: clog.order_no,
              auth_no: clog.approval_number,
            },
            order: [
              ['id', 'DESC'], // 그중에서도 가장 최신 데이터를
            ],
            limit: 1, // 1개만 선택
          });
          const charger = await models.sb_charger.findByPk(clog?.chg_id);
          const pgCno = clog?.cno ?? icPaymentNotification?.cno;
          const mallId = icPaymentNotification?.memb_id ?? charger?.mall_id;
          let inputTransactionID = '0';
          if (icPaymentNotification?.order_no) {
            inputTransactionID = icPaymentNotification?.order_no;
          }

          let refundResult;

          // 트랜잭션아이디는 다른거 여러번 날아 가도록 만드는게 맞다. 만약 현장결제시 안된다면 KICC에 문의해야함.
          const encKey = process.env.KICC_REQ_BILLING_SECRET_KEY;
          refundResult = await refundRequestFromKICC(refundAmt.toString(), pgCno, mallId, inputTransactionID, encKey);

          try {
            const logData = {
              url: _request.url,
              content: refundResult,
              userId: clog?.userId,
            };
            console.log('charging-status::service::store log::success', logData);
            await models.AllLogs.create(logData);
          } catch (err) {
            console.log('charging-status::service::store log::err', err);
          }

          // 부분취소결제의 콜백을 sb_charge_requests에 넣어줘야 한다.
          const canselInput = {
            request_type: 'CANCEL',
            chg_id: params?.chg_id,
            conn_id: params?.conn_id,
            chargingLogId: clog?.cl_id,
            pgCno: clog?.pg_cno,
            refund_amt: refundAmt,
            paymentResponse: refundResult,
          };
          const sb_req = await models.sb_charge_request.create(canselInput);
          await sb_req.save();

          console.log('!! 부분취소결제 결과 !!', refundResult);
          if (refundResult?.resCd === '0000') {
            // 결제 성공
            isRefundRequestSuccess = true;
            clog.authDate = moment().format('YYYY-MM-DD HH:mm:ss');
            clog.payCompletedYn = 'Y';
            await clog.save();
          }
          if (isRefundRequestSuccess) {
            // TODO 부분취소 성공 시 2lvl 알림 전송
            const sendChgHisMsgNormal = sendChgHisMsg(
              prePaidChargeString,
              usedKwhString,
              clog?.appliedUnitPrice,
              chargeFeeString,
              unplugDateString,
              refundAmtString,
              actualPaidAmtString,
              phoneString
            );

            // const icResultMessageSuccess = `[EV&U] 충전 결제 내역 입니다.
            // [선결제 내역]
            // 충전 금액 : ${prePaidChargeString}원
            //
            // [충전 내역]
            // 총 충전량 : ${usedKwhString}kWh
            // 충전 단가 : ${clog?.appliedUnitPrice}원
            // 충전 금액 : ${chargeFeeString} 원
            // 충전 완료 : ${unplugDateString}
            //
            // [결제 내역]
            // 취소 금액 : ${refundAmtString} 원
            // 최종 결제 금액 : ${actualPaidAmtString} 원
            //
            // 취소금액은 카드사에 따라 2~3 영업일 이후에 한도에 반영될수도 있습니다.
            //
            // 다른 고객의 충전을 충전을 위하여 차량을 이동해주세요.
            //
            // 고객센터 ${phoneString}
            //
            // -HD현대오일뱅크-`;

            // Todo 문자 전송하기
            await sendTalkAndLms(
              clog?.receivePhoneNo,
              sendChgHisMsgNormal?.message,
              sendChgHisMsgNormal?.templateCode,
              clog?.chg_id
            );
            msg = '성공적으로 결제 취소를 했습니다.';
          } else {
            const sendPartCancelFailedData = sendPartCancelFailedMsg(actualPaidAmtString, phoneString);
            await sendTalkAndLms(
              clog?.receivePhoneNo,
              sendPartCancelFailedData?.message,
              sendPartCancelFailedData?.templateCode,
              clog?.chg_id
            );
            // Todo 부분취소가 실패했을때, 미취소 상황에 대한 안내메시지 필요하지 않을까?
            msg = '현장결제 부분 취소를 실패 했습니다.';
          }
        }
      } else {
        // 현장결제가 아닌 후불 결제 Case
        const defaultPrice = await models.Config.findOne({
          where: {
            divCode: 'DEFAULT_UNITPRICE',
          },
        });
        // user의 request_charge 로그에서 카드번호를 찾음.
        const userId = clog?.usersNewId;
        if (!userId) {
          // Todo 해당 충전건에서 유저 정보를 찾지 못함으로인해 후불결제 실패. 미수기록 작성 할것.
          msg = '유저 정보를 찾지 못했습니다.';
          return;
        }
        const sb_charge_request = await models.sb_charge_request.findOne({
          where: {
            userId: userId,
          },
          order: [['cr_id', 'DESC']],
          limit: 1,
        });
        const card_id = sb_charge_request?.card_id;
        const card = await models.BankCard.findByPk(card_id, {});
        if (!card) {
          // Todo 카드정보를 찾지 못함으로 후불결제 실패.
          msg = '카드정보를 찾지 못했습니다.';
          return;
        }

        // 해당 카드의 id로 카드의 빌링키를 찾음.
        const billingKey = card?.billingKey;
        if (!billingKey) {
          // Todo 빌링키를 찾지 못함으로 후불결제 실패. 미수기록 작성 할것.
          msg = '빌링키 정보를 찾지 못했습니다.';
          return;
        }

        // 결제금액 보정작업
        const usedKwh = clog?.cl_stop_meter - clog?.cl_start_meter ?? 0;
        let adjustedKwh;
        const originalFee = Math.floor(usedKwh * clog?.appliedUnitPrice * 0.001);
        // desired_kwh값이 존재할 경우 잡손실처리후 보정kwh로 안내
        if (clog?.desired_kwh && parseFloat(usedKwh) > parseFloat(clog?.desired_kwh)) {
          // 현장이든, 앱이든 사용량이 desired_kwh보다 큰 경우는 깎아서 적용 시키는게 맞다.
          clog.ignored_kwh = usedKwh - clog?.desired_kwh;
          adjustedKwh = clog?.desired_kwh;
        } else if (clog?.desired_amt && originalFee > clog?.desired_amt) {
          // 희망금액 기준으로 오바되도 깎아준다. 여기선 소수점을 올려줘야 499.9997 이런 계산이 나오면서 499원이 결제되는 일이 없어진다.
          let adjustedKwhFromAmt = Math.ceil((clog?.desired_amt / clog?.appliedUnitPrice) * 1000);
          clog.ignored_kwh = usedKwh - adjustedKwhFromAmt;
          adjustedKwh = adjustedKwhFromAmt;
        } else {
          adjustedKwh = usedKwh;
        }

        let chargeFee = Math.floor(adjustedKwh * clog?.appliedUnitPrice * 0.001);

        // 만약 금액이 10원을 넘지 않는다면 결제를 마무리시키고 잡손실 처리한다.
        if (chargeFee < 10) {
          clog.payCompletedYn = 'Y';
          clog.cl_kwh = 0;
          clog.ignored_kwh = usedKwh;
          await clog.save();
          msg = '후불결제 금액 10원 미만으로 결제를 진행하지 않았습니다.';
          return;
        }
        clog.chargeFee = chargeFee;

        sb_charge_request.actual_calculated_amt = chargeFee;
        await sb_charge_request.save();
        const usedKwhString = (adjustedKwh * 0.001).toFixed(2);
        const chargeFeeString = priceToString(chargeFee);
        const unplugDate = getKoreanDate();
        const unplugDateString = getFormatDateToMinutes(unplugDate);
        const phoneString = phoneFormatter(process.env.SMS_NUM || '15515129');

        // 미출차 (PARK_ALLOW_MIN) 관련 로직은 추후에 다시 계산해서 적용할 것.(2023-10-14)
        let isPayRequestSuccess = false;
        // 후불결제의 경우 차징로그 -> 충전기 -> 충전기의 몰아이디가 우선순위
        // 만약 이 값이 존재하지 않는다면 현대 마스터 mallId로 결제를 진행한다.
        const charger = await models.sb_charger.findByPk(params?.chg_id);

        const payMallId = charger?.mall_id2;
        let paymentResult;
        if (payMallId) {
          // 노티를 찾는데 성공했고, 그 노티에 가맹점의 mallId가 들어있는 경우
          paymentResult = await payRequestFromKICC(chargeFee, billingKey, payMallId);
        } else {
          // 그 외의 경우 (결제는 되었지만 노티만 들어오지 않은 경우. 이경우 원천 거래번호로 취소를 하되, 취소건에대한 노티는
          // HDO 마스터계정쪽으로 들어올 것이다.)
          paymentResult = await payRequestFromKICC(chargeFee, billingKey);
        }
        console.log('!! 후불결제 결과 !!', paymentResult);
        // log payment result
        try {
          const logData = {
            url: _request.url,
            content: paymentResult,
            userId: clog?.userId,
          };
          console.log('charging-status::service::store log::success', logData);
          await models.AllLogs.create(logData);
        } catch (err) {
          console.log('charging-status::service::store log::err', err);
        }

        /*
          { "pgCno": "23102317480310873817",
            "resCd": "0000",
            "amount": 1014, "mallId": "05574880", "resMsg": "단독승인 정상",
            "escrowUsed": "N", "statusCode": "TS03",
            "paymentInfo":
              {
                "cpCode": "",
                "mobInfo": {"authId": "", "billId": "", "mobileCd": "", "mobileNo": "", "mobileAnsimUsed": ""
              },
            "bankInfo": {"bankCode": "", "bankName": ""},
            "cardInfo":
              { "cardNo": "41918700****383*",
                "vanSno": "231711674998", "cardGubun": "N", "subCardCd": "526", "cardMaskNo": "",
                "issuerCode": "026", "issuerName": "하나비씨카드", "acquirerCode": "026",
                "acquirerName": "비씨카드사", "cardBizGubun": "P", "couponAmount": 0,
                "partCancelUsed": "Y", "installmentMonth": 0, "freeInstallmentTypeCode": "00"},
                "approvalNo": "61879579", "prepaidInfo": {"billId": "", "remainAmount": 0},
                "approvalDate": "20231023174803", "basketInfoList": [], "multiPntAmount": "",
                "cashReceiptInfo": {"resCd": "", "resMsg": "", "approvalNo": "", "approvalDate": ""},
                "multiCardAmount": "",
                "multiCponAmount": "",
                "payMethodTypeCode": "11",
                "virtualAccountInfo": {"bankCode": "", "bankName": "", "accountNo": "", "expiryDate": "", "depositName": ""}
               },
            "shopOrderNo": "order-refund-231023-tr-1698050883986",
            "msgAuthValue": "33367d2e92154a220e72a2759f56a3d8764b7dbbe81bb505805db04eab89f62b",
            "statusMessage": "매입요청",
            "transactionDate": "20231023174803",
            "shopTransactionId": "refund-231023-tr-1698050883986"}

        */

        sb_charge_request.paymentResponse = paymentResult;
        clog.pg_cno = paymentResult?.pgCno;
        clog.order_no = paymentResult?.shopOrderNo;
        clog.approval_number = paymentResult?.paymentInfo?.approvalNo;
        clog.payMethodDetail = paymentResult?.paymentInfo?.cardInfo?.cardNo;
        const user = await models.UsersNew.findByPk(userId);
        if (user) {
          clog.receivePhoneNo = user?.phoneNo;
        }
        await clog.save();
        await sb_charge_request.save();
        if (paymentResult?.resCd === '0000') {
          // 결제 성공
          isPayRequestSuccess = true;
          clog.authDate = moment().format('YYYY-MM-DD HH:mm:ss');
          clog.payCompletedYn = 'Y';
          await clog.save();
        }
        if (!isPayRequestSuccess) {
          // 결제 실패 시 미수기록 작성
          // TODO 결제 실패 시 3lvl 알림 전송
          msg = '결제에 실패하여 미수기록을 작성하였습니다.';
          const payFailLogInput = {
            cl_id: clog.cl_id,
            resCd: paymentResult?.resCd,
            resMsg: paymentResult?.resMsg,
            statusCode: paymentResult?.statusCode,
          };
          await models.sb_charging_pay_fail_log.create(payFailLogInput);
          clog.expectedAmt = chargeFee;
          clog.afterPaidAmt = 0;
          await clog.save();
        } else {
          // TODO 결제 성공 시 3lvl 알림 전송
          msg = '앱 후불 결제에 성공하였습니다.';
          const sendChgHisMsgNormal = sendChgHisMsg(
            '0',
            usedKwhString,
            clog?.appliedUnitPrice,
            chargeFeeString,
            unplugDateString,
            '0',
            chargeFeeString,
            phoneString
          );
          await sendTalkAndLms(
            clog?.receivePhoneNo,
            sendChgHisMsgNormal?.message,
            sendChgHisMsgNormal?.templateCode,
            clog?.chg_id
          );
        }
      }
    }
  } catch (e) {
    // next(e);
    console.log('error : ', e?.stack);
    try {
      const logData = {
        url: _request.url,
        content: e,
        userId: clog?.userId,
        level: LOG_LEVEL.ERROR,
      };
      console.log('charging-status::service::store log::success', logData);
      await models.AllLogs.create(logData);
    } catch (err) {
      console.log('charging-status::service::store log::err', err);
    }
  } finally {
    // 에러가 나든 안나든 에러핸들러로 넘기는게 아니라, 무조건 리턴을 해야함.
    _response.json({
      result: `신호정상수신 ${old_status} => ${new_status}
    충전기아이디 : ${params?.chg_id}
    충전기채널, 커넥터아이디 : ${params?.conn_id}
    트랜잭션 아이디 : ${params?.trans_id}
    idTag : ${params?.idTag}
    결과 : ${msg}
    `,
    });
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  // OCPP통신에서는 이곳에서 포맷이 다른 응답을 해주면 주고받기 플로우가 끊기는 것임. 들어올 필요가 없는 곳.
  console.log('!!! 에러핸들러 !!!', _error.toString());

  if (_error === 'NOT_EXIST_CHARGING_LOG') {
    _response.error.notFound(_error, '충전 로그가 존재하지 않습니다.');
    return;
  }
  if (_error === 'NOT_EXIST_USER') {
    _response.error.notFound(_error, '결제 요청 유저 정보가 존재하지 않습니다.');
    return;
  }
  if (_error === 'NOT_EXIST_CARD') {
    _response.error.notFound(_error, '결제요청 카드 정보가 존재하지 않습니다.');
    return;
  }
  if (_error === 'NOT_EXIST_BILLING_KEY') {
    _response.error.notFound(_error, '결제요청 카드의 빌링키 정보를 찾을 수 없습니다.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
