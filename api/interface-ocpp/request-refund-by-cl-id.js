/**
 * Created by Jackie Yoon on 2023-08-09.
 * Updated by HDC on 2023.10.30.
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const axios = require('axios');
const crypto = require('crypto');
// const notification = require('../../middleware/send-notification');
const { refundRequestFromKICC } = require('../../util/paymentUtil');
const { Op } = require('sequelize');
const { sendLms } = require('../../util/sendLmsUtil');
const { priceToString, phoneFormatter, getFormatDateToMinutes } = require('../../util/common-util');
const { sendRefMsg } = require('../../util/notificationTalk/notificationTemplate');
const { sendTalkAndLms } = require('../../util/sendTalkAndLmsUtil');

module.exports = {
  path: ['/request-refund'],
  method: 'post',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  /**
   * 부분취소, 환불등 변경은 mallId와 pgCno, msgAuthValue만 맞으면 가능하다.
   * 환불을 할때 노티만 존재하고 충전은 존재하지 않는 데이터가 있을 수 있기 때문에
   * sb_charging_logs의 cl_id를 기준으로 잡으면 안되고, 노티에서 출발해서
   * 모든 필요사항과 기준 조건을 찾아낸후 환불이 가능해야 한다.(2023.11.01)
   * pgCno는 유일한 값이라고 한다. 다른 검증은 필요하지 않다.
   */
  const userId = _request?.user?.id;

  try {
    const user = await models.UsersNew.findByPk(userId);

    // 환불 금액
    const refundAmount = _request.body?.refundAmount;
    if (!refundAmount) throw 'NEED_REFUND_AMT';

    // 승인번호
    const pg_cno = _request.body?.pgCno;
    if (!pg_cno) throw 'NEED_PGCNO';

    // 환불코드
    const div_code = _request.body?.div_code;
    // 환불사유
    const refund_reason = _request.body?.refund_reason;

    /*
     * refundRequestFromKICC
     *   ( refundAmount, pgCno, mallId = process.env.EASYPAY_MALL_ID,inputTransactionID = '0',
     *     encKey = process.env.KICC_REQ_BILLING_SECRET_KEY, cancelReqDate = formatDate(new Date())
     *   )
     * */

    const originPayNotification = await models.PaymentNotification.findOne({
      where: {
        cno: pg_cno,
        noti_type: '10',
      },
      order: [['id', 'DESC']],
      limit: 1,
    });
    console.log('오리지널 노티', JSON.stringify(originPayNotification));
    // 노티를 찾지 못하면 환불도 할 수 없다. 일단은 이렇게 가자.
    if (!originPayNotification) throw 'NOT_EXIST_PAMYMENT_DATA';

    // 1. mallId : 원본 결제의 memb_id다.
    const mallId = originPayNotification?.memb_id ?? process.env.KICC_MALL_ID;
    console.log('applied mallId', mallId);

    /**
     * 어떤 결제의 거래상태코드는 아래와 같다. 과연 부분취소 결제만 모두 찾아 제외하면
     * 그게 환불가능금액이 맞을까?
     *
     * RF01 : 환불요청
     * RF02 : 환불완료
     * RF03 : 환불거절
     *
     * TS01 : 승인
     * TS02 : 승인취소
     * TS03 : 매입요청
     * TS04 : 매입
     * TS05 : 매입취소
     * TS06 : 부분매입(승인)취소
     * TS07 : 입금대기
     * TS08 : 입금완료
     */

    // 만약 같은 pgCno로 승인취소된 노티, 매입취소된 노티가 있다면 그 건은 환불이 불가능하다.
    const where_ = { [Op.and]: [{ cno: pg_cno }] };
    where_[Op.and].push({
      [Op.and]: [
        {
          tran_date: { [Op.gte]: originPayNotification?.tran_date },
        },
        {
          stat_cd: { [Op.in]: ['TS02', 'TS05'] },
        },
      ],
    });

    const { count_, rows: canceledPays } = await models.PaymentNotification.findAndCountAll({ where: where_ });
    if (count_ > 0) {
      throw 'ALREADY_CANCELED';
    }

    // 해당건에 대한 환불 가능 금액 계산
    const originalPaymentTotal = originPayNotification?.amount;

    // 원본결제 이후 발생한 부분취소 결제들 모두 찾기
    const where = { [Op.and]: [{ cno: pg_cno }] };
    where[Op.and].push({
      [Op.and]: [
        {
          tran_date: { [Op.gte]: originPayNotification?.tran_date },
        },
        {
          stat_cd: 'TS06',
        },
      ],
    });

    const { count, rows: cancelPays } = await models.PaymentNotification.findAndCountAll({ where: where });

    let cancelAmt = 0;
    cancelPays.forEach((v, i, arr) => {
      cancelAmt = cancelAmt + v?.mgr_amt;
    });

    const possibleCancelAmt = originalPaymentTotal - cancelAmt;

    if (parseInt(refundAmount) > possibleCancelAmt) {
      throw 'MAX_REFUND_AMT_EXCEEDED';
    }

    if (refundAmount === 0) {
      _response.json({
        status: '200',
        message: '취소 금액이 0원이므로 취소 요청을 하지 않았습니다.',
      });
      return;
    } else {
      // 결제 취소 진행
      let isRefundRequestSuccess = false;
      /**
       * 00 : 조회
       * 20 : 매입
       * 32 : 부분승인취소(신용카드)
       * 33 : 부분취소(계좌이체, 휴대폰결제, SSG머니, 계좌-간편결제
       * 40 : 즉시취소
       * 51 : 현금영수증 단독발행 취소
       * 52 : 현금영수증 단독발행 부분취소
       * 60 : 환불
       * 61 : 에스크로변경
       * 62 : 부분환불
       * 63 : 실시간환불
       *
       */

      // 현재로선 CS에선 부분취소가 대부분.
      const refundResult = await refundRequestFromKICC(refundAmount.toString(), pg_cno, mallId);

      try {
        const cardLogData = {
          url: _request.url,
          content: refundResult,
          userId: _request.user.id,
        };
        console.log('pay method approval::service::store log::success', refundResult);
        await models.AllLogs.create(cardLogData);
      } catch (err) {
        console.log('pay method approval::service::store log::err', err);
      }

      if (refundResult?.resCd === '0000') {
        // 결제 성공
        isRefundRequestSuccess = true;
      }
      /*
      {
        "resCd": "0000",
        "resMsg": "정상처리",
        "mallId": "05574880",
        "shopTransactionId": "refund-231108-tr-1699426218040",
        "shopOrderNo": "order-refund-231108-tr-1699423232781",
        "oriPgCno": "23110815003010195301",
        "cancelPgCno": "23110815501510286315",
        "transactionDate": "20231108155015",
        "cancelAmount": 490,
        "remainAmount": 0,
        "statusCode": "TS06",
        "statusMessage": "부분매입취소",
        "escrowUsed": "N",
        "reviseInfo": {
          "payMethodTypeCode": "11",
          "approvalNo": "",
          "approvalDate": "20231108155015",
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
      let inputDivCode = div_code?.toString().trim();
      if (inputDivCode === '') {
        inputDivCode = 'BROKEN';
      }

      if (isRefundRequestSuccess) {
        await models.RequestRefund.create({
          div_code: inputDivCode,
          refund_reason: refund_reason,
          userId: userId,
          orgId: user?.orgId,
          noti_id: originPayNotification?.id,
          oriPgCno: refundResult?.oriPgCno,
          cancelPgCno: refundResult?.cancelPgCno,
          statusCode: refundResult?.statusCode,
          cancelAmount: refundResult?.cancelAmount,
        });

        const oriAmount = originPayNotification?.amount;
        const totalCancelAmount = cancelAmt + refundResult?.cancelAmount;
        const totalAmount = originPayNotification?.amount - totalCancelAmount;
        const chargingPrice = priceToString(oriAmount);
        const totalRefunPrice = priceToString(totalCancelAmount);
        const comPrice = priceToString(totalAmount);
        const callCenNum = phoneFormatter(process.env.SMS_NUM || process.env.CS_CALL_NUM || '15515129');

        // Todo 문자 전송하기
        // 오리지널 노티를 이용해 충전로그를 찾고, 충전로그에 들어있는 번호로 문자를 보낸다.
        // 전송에 실패했거나, 충전로그를 찾지못해 전화번호를 찾지 못했을 경우 응답으로 알려준다.
        // 응답을 보고 상담원은 직접 고객의 번호로 문자를 수동으로 보내줄 수 있다.
        const clog = await models.sb_charging_log.findOne({
          where: {
            [Op.and]: [
              {
                order_no: {
                  [Op.eq]: originPayNotification?.order_no,
                },
              },
              {
                approval_number: {
                  [Op.eq]: originPayNotification?.auth_no,
                },
              },
            ],
          },
          // order by 쿼리 이상한거 해결해라.
          order: [['cl_id', 'DESC']],
        });
        const includeSendResult = {
          status: '200',
          resCd: refundResult?.resCd,
          message: refundResult?.resMsg,
          sendResult: 'SUCCESS',
        };
        const startChargeTime = getFormatDateToMinutes(new Date(clog?.cl_start_datetime));
        const endChargeTime = getFormatDateToMinutes(new Date(clog?.cl_end_datetime));
        let chargerId = '';
        const charger = models.sb_charger.findByPk(clog?.chg_id);
        if (charger) {
          chargerId = charger?.chg_charger_id;
        }
        const sendRefMsgData = sendRefMsg(
          startChargeTime,
          endChargeTime,
          chargerId,
          chargingPrice,
          totalRefunPrice,
          comPrice,
          callCenNum
        );

        if (clog?.receivePhoneNo) {
          const response = await sendTalkAndLms(
            clog?.receivePhoneNo,
            sendRefMsgData?.message,
            sendRefMsgData?.templateCode
          );
          const res_cd = response?.data[0]?.code;
          if (res_cd === 'EW' || res_cd === 'SS' || res_cd === 'AS') {
            // 취소결제에도 성공하고, 문자발송도 성공한 경우
            console.log('Talk And LMS SUCCESS');
            _response.json(includeSendResult);
            return;
          } else {
            // 취소결제엔 성공했으나, 문자발송이 실패한 경우
            console.log('Talk And LMS FAIL');
            includeSendResult['sendResult'] = 'FAIL';
            _response.json(includeSendResult);
            return;
          }
          // TODO 부분취소 성공 시 2lvl 알림 전송
        } else {
          // 취소결제엔 성공했으나 휴대폰번호를 찾지 못해 자동으로 문자발송은 시도하지 않은 경우
          includeSendResult['sendResult'] = 'NO_SEND_NO_PHONENO';
          _response.json(includeSendResult);
          return;
        }
      } else {
        // 취소결제에 실패한 경우
        _response.json({
          status: '200',
          resCd: refundResult?.resCd,
          message: refundResult?.resMsg,
          sendResult: 'NO_SEND',
        });
        return;
      }
    }
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  if (_error === 'NEED_REFUND_AMT') {
    _response.error.badRequest(_error, '환불금액을 입력하세요.');
    return;
  }
  if (_error === 'NOT_EXIST_PAMYMENT_DATA') {
    _response.error.badRequest(_error, '결제 내역 데이터가 존재하지 않습니다.');
    return;
  }
  if (_error === 'NEED_PGCNO') {
    _response.error.badRequest(_error, 'PGCNG(거래번호)가 필요합니다.');
    return;
  }
  if (_error === 'ALREADY_CANCELED') {
    _response.error.badRequest(_error, '이미 취소된 거래입니다.');
    return;
  }
  if (_error === 'MAX_REFUND_AMT_EXCEEDED') {
    _response.error.badRequest(_error, '환불가능한 최대금액을 초과하였습니다.');
    return;
  }
  if (_error === 'CANNOT_FIND_CLOG') {
    _response.error.badRequest(_error, '충전 로그를 찾을 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
