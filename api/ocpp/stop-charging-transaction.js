/**
 * Created by hdc on 2023-09-19
 * OCPP -> Request -> BE
 * 충전기, OCPP로부터 실제로 start 되었다는 신호를 받은 후의 로직
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const {
  getFormatDate,
  phoneFormatter,
  priceToString,
  getKoreanDate,
  getFormatDateToMinutes,
} = require('../../util/common-util');
const { sendTalkAndLms } = require('../../util/sendTalkAndLmsUtil');
const {
  sendStopReasonEtcMsg,
  sendChgHisMsg,
  sendPartCancelFailedMsg,
} = require('../../util/notificationTalk/notificationTemplate');
const { refundRequestFromKICC, payRequestFromKICC } = require('../../util/paymentUtil');
const moment = require('moment');

module.exports = {
  path: ['/stop-charging-transaction'],
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
    conn_id: _request.body.conn_id, // 충전기채널
    transId: _request.body.transId, // 트랜잭션 아이디, TransAction ID
    stop_meter: _request.body.stop_meter, // 그 충전기의 트랜잭션 종료시 전력량계 미터값
    idTag: _request.body.idTag, // 멤버쉽번호, ID카드번호, 앞에 IC가 붙어있으면 현장결제 고유번호, RS가 붙어 있었다면 RS{회원pk}
    reason: _request.body.reason,
  };

  // {
  //   "chg_id": 2,
  //   "conn_id": 1,
  //   "transId": 12341234,
  //   "stop_meter": 231,
  //   "idTag": "IC1111222233334444",
  //   "reason": "REASON"
  // }

  let res = {};

  try {
    // chg_id 충전기인덱스
    // cl_channel : conn_id  충전기채널번호
    // cl_transaction_id : transId  트랜잭션 아이디
    // cl_order_user_no : idTag  멤버십 카드 ID 또는 현장결제 고유번호
    // cl_end_datetime 트랜잭션 시작시간 ( 자바스크립트 now 타임스탬프로 만들어서 넣기 )
    // appliedUnitPrice 적용단가 (충전기 단가 현재시간으로 조인해서 맞추기) - 나중에 시간별로 다르게 계산한다면 걍 NULL처리
    // cl_stop_meter : stop_meter 충전기 충전 시작값

    // 차징로그 데이터를 넣어줄때, cl_order_user_no에 RS가 붙어있던 idTag의 경우 RS를 떼어내서 넣어줬기 때문에, 다시 찾기 위해선
    // 이번에도 RS가 붙어 있다면 떼어주는 작업을 해야 한다.
    let initialTag = params?.idTag;
    let convertedIdTag = initialTag;
    if (initialTag && initialTag.startsWith('RS')) {
      convertedIdTag = initialTag.replace('RS', '').trim();
    }

    // limit나 max값을 주지 않으면, 언젠가는 중복값이 생길수밖에 없다.
    // 이유는 모르겠지만, idTag값이 100% 완벽한값이 넘어오는것 같진 않다.
    // 트랜잭션 아이디와 충전기아이디, 커넥터 아이디를 가지고 max값을 조회하는 식으로 넘어가야할 것 같다.(2023.10.15 - 추후 천만분의1의 확률로 중복값이 생길수 있음.)
    const clog = await models.sb_charging_log.findOne({
      where: {
        chg_id: params?.chg_id,
        cl_channel: params?.conn_id,
        cl_transaction_id: params?.transId,
      },
      order: [['cl_id', 'DESC']],
      limit: 1,
    });
    if (clog) {
      // 여기서 계산안함. 차징로그에 대한 정보처리만 함.
      clog.cl_end_datetime = getFormatDate(new Date());
      clog.cl_stop_meter = params?.stop_meter;
      clog.cl_kwh = params?.stop_meter - clog.cl_start_meter;
      clog.reason = params?.reason;
      await clog.save({ fields: ['cl_end_datetime', 'cl_stop_meter', 'cl_kwh', 'reason'] });
      await clog.reload();

      // 비상정지등 정상종료 상황이 아니라면 faulted로 넘어갈 것이므로 결제마무리 시키고
      // 문자 보내줌.
      let reasonMap = new Map();
      reasonMap.set('emergencystop', '비상정지');
      reasonMap.set('other', '비상정지');
      reasonMap.set('hardreset', '기타');
      reasonMap.set('softreset', '기타');
      reasonMap.set('reboot', '재부팅');
      reasonMap.set('powerloss', '전원불량');
      reasonMap.set('evdisconnected', '시스템 연결 불량');
      reasonMap.set('unlockcommand', '기타');
      reasonMap.set('deauthorized', '기타');
      const reasonStr = params?.reason?.toLowerCase();
      const phoneString = phoneFormatter(process.env.SMS_NUM || '15515129');
      let chargerId = '';
      const charger = await models.sb_charger.findByPk(clog?.chg_id)
      if (charger) {
        chargerId = charger?.chg_charger_id
      }
      if (params?.reason && reasonStr && reasonStr !== '' && reasonStr !== 'local' && reasonStr !== 'remote') {
        const sendStopReasonEtcData = sendStopReasonEtcMsg(
          chargerId,
 reasonMap.get(reasonStr) ?? '기타',
          params?.reason,
          phoneString
        );
        await sendTalkAndLms(
          clog?.receivePhoneNo,
          sendStopReasonEtcData?.message,
          sendStopReasonEtcData?.templateCode,
          clog?.chg_id
        );
        // 기타 종료 상황 이곳에서 결제를 마무리 시키고, 알림톡도 보낸다.
        // 현장 선결제를 부분취소 하려는건지 후불결제를 일으키려는 것인지 판단.
        if (clog?.cl_order_user_no.startsWith('IC')) {
          // 현장결제 케이스
          const prePaidCharge = clog?.authAmtCharge; // 선결제금액
          const prePaidChargeString = priceToString(prePaidCharge);
          let usedKwh = parseInt(clog?.cl_stop_meter) - parseInt(clog?.cl_start_meter) ?? clog?.cl_kwh;
          const usedKwhString = (usedKwh * 0.001).toFixed(2);
          let adjustedKwh;
          if (parseFloat(usedKwh) > parseFloat(clog?.desired_kwh)) {
            clog.ignored_kwh = usedKwh - clog?.desired_kwh;
            adjustedKwh = clog?.desired_kwh;
          } else {
            adjustedKwh = usedKwh;
          }
          const chargeFee = Math.floor((adjustedKwh ?? 0) * clog?.appliedUnitPrice * 0.001);
          clog.chargeFee = chargeFee;
          const chargeFeeString = priceToString(chargeFee);
          let refundAmt = prePaidCharge - chargeFee;
          if (refundAmt <= 0) {
            refundAmt = 0;
          }
          const actualPaidAmt = prePaidCharge - refundAmt;
          const actualPaidAmtString = priceToString(actualPaidAmt);
          const refundAmtString = priceToString(refundAmt);
          // 언플러그는 앞으로 더이상 추적되지 않기에 그냥 선을 뽑았다고 처리해준다.
          const unplugDate = getKoreanDate();
          const unplugDateString = getFormatDateToMinutes(unplugDate);
          const phoneString = phoneFormatter(process.env.SMS_NUM || '15515129');
          if (refundAmt === 0) {
            const sendChgHisMsgZero = sendChgHisMsg(
              prePaidChargeString,
              usedKwhString,
              clog?.appliedUnitPrice,
              chargeFeeString,
              unplugDateString,
              refundAmtString,
              actualPaidAmtString,
              phoneString
            );
            await sendTalkAndLms(
              clog?.receivePhoneNo,
              sendChgHisMsgZero?.message,
              sendChgHisMsgZero?.templateCode,
              clog?.chg_id
            );
            clog.payCompletedYn = 'Y';
            await clog.save();
            res = {
              result: 'success',
            };
          } else {
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
            const encKey = process.env.KICC_REQ_BILLING_SECRET_KEY;
            refundResult = await refundRequestFromKICC(refundAmt.toString(), pgCno, mallId, inputTransactionID, encKey);
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
              await sendTalkAndLms(
                clog?.receivePhoneNo,
                sendChgHisMsgNormal?.message,
                sendChgHisMsgNormal?.templateCode,
                clog?.chg_id
              );
              res = {
                result: 'success',
              };
            } else {
              const sendPartCancelFailedData = sendPartCancelFailedMsg(actualPaidAmtString, phoneString);
              await sendTalkAndLms(
                clog?.receivePhoneNo,
                sendPartCancelFailedData?.message,
                sendPartCancelFailedData?.templateCode,
                clog?.chg_id
              );
            }
          }
        } else {
          // 후불결제인 경우
          const defaultPrice = await models.Config.findOne({
            where: {
              divCode: 'DEFAULT_UNITPRICE',
            },
          });
          const userId = clog?.usersNewId;
          if (userId) {
            const sb_charge_request = await models.sb_charge_request.findOne({
              where: {
                userId: userId,
              },
              order: [['cr_id', 'DESC']],
              limit: 1,
            });
            const card_id = sb_charge_request?.card_id;
            const card = await models.BankCard.findByPk(card_id, {});
            if (card && card?.billingKey) {
              // 모든 값이 유효하게 들어가 있지않으면 에러핸들링도 하지 않고 처리를 안하고 응답만 한다
              const usedKwh = clog?.cl_stop_meter - clog?.cl_start_meter ?? 0;
              let chargeFee = Math.floor(usedKwh * clog?.appliedUnitPrice * 0.001);
              if (chargeFee >= 10) {
                sb_charge_request.actual_calculated_amt = chargeFee;
                await sb_charge_request.save();
                const usedKwhString = (usedKwh * 0.001).toFixed(2);
                const chargeFeeString = priceToString(chargeFee);
                const unplugDate = getKoreanDate();
                const unplugDateString = getFormatDateToMinutes(unplugDate);
                const phoneString = phoneFormatter(process.env.SMS_NUM || '15515129');
                let isPayRequestSuccess = false;
                const charger = await models.sb_charger.findByPk(clog?.chg_id);
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
                console.log('!! 기타종료 후불결제 결과 !!', paymentResult);
                sb_charge_request.paymentResponse = paymentResult;
                clog.pg_cno = paymentResult?.pgCno;
                clog.order_no = paymentResult?.shopOrderNo;
                clog.approval_number = paymentResult?.cardInfo?.approvalNo;
                clog.payMethodDetail = paymentResult?.cardInfo?.cardNo;
                const user = await models.UsersNew.findByPk(userId);
                if (user) {
                  clog.receivePhoneNo = user?.phoneNo;
                }
                await clog.save();
                await clog.reload();
                await sb_charge_request.save();
                if (paymentResult?.resCd === '0000') {
                  // 결제 성공
                  isPayRequestSuccess = true;
                  clog.authDate = moment().format('YYYY-MM-DD HH:mm:ss');
                  clog.payCompletedYn = 'Y';
                  await clog.save();
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
              } else {
                // 10원이하라 결제시킬 필요가 없을때.
                clog.payCompletedYn = 'Y';
                clog.cl_kwh = 0;
                clog.ignored_kwh = usedKwh;
                await clog.save();
              }
            }
          }
        }
      }
      res = {
        result: 'success',
      };
    } else {
      // 차징로그 없을때
      res = {
        result: 'fail',
        msg: '해당되는 충전 트랜잭션이 존재하지 않습니다.',
      };
    }
  } catch (e) {
    console.log('스탑트랜잭션에러 :', e?.stack);
  } finally {
    _response.json(res);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
