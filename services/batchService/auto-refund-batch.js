"use strict";
const models = require("../../models");
const sequelize = require("sequelize");
const {getFormatDate, getKoreanDate} = require("../../util/common-util")
const moment = require('moment');
const schedule = require('node-schedule');
const {Op} = require("sequelize");
const cryptor = require("../../util/cryptor");
const axios = require("axios");
const {sendLms} = require("../../util/sendLmsUtil");
const { refundALLRequestFromKICC } = require("../../util/paymentUtil")
const {sendTalkAndLms} = require("../../util/sendTalkAndLmsUtil");
const {sendRefundMsg} = require("../../util/notificationTalk/notificationTemplate");

async function processRefund() {
  try {
    const noChargedPayInfos = await models.sb_charge_local_ic_pay.findAll({
      where: {
        cl_id: null,
        pg_cno: { [Op.ne]: null },
        mall_id: { [Op.ne]: null },
        autoRefundYn: "N",
        updatedAt: {
          [Op.lt]: new Date(new Date() - 4 * 60 * 1000) // 현재 시간보다 4분 이상 전
        }
      }
    });

    let cnt = 0
    for (const payInfo of noChargedPayInfos) {
      // pg_cno와 mall_id를 이용하여 refundALLRequestFromKICC 함수를 동기식으로 실행
      const refundResult = await refundALLRequestFromKICC(payInfo.pg_cno, payInfo.mall_id);
      let isRefundRequestSuccess = false;
      if (refundResult?.resCd === "0000") {
        // 결제 성공
        isRefundRequestSuccess = true;
        await models.RequestRefund.create({
          div_code: "ETC",
          refund_reason: "충전 미시작으로 인한 자동취소",
          noti_id: null,
          oriPgCno: refundResult?.oriPgCno,
          cancelPgCno: refundResult?.cancelPgCno,
          statusCode: refundResult?.statusCode,
          cancelAmount: refundResult?.cancelAmount
        })
        const sendRefundMsgData = sendRefundMsg(refundResult?.cancelAmount)

        // const autoCancelMsg = `[EV&U] 자동 취소 안내.
        //
        // 충전 미시작으로 인해 ${refundResult?.cancelAmount}원 취소 되었습니다.
        //
        // -HD현대오일뱅크-
        // `

        await sendTalkAndLms(payInfo?.phone, sendRefundMsgData?.message, sendRefundMsgData?.templateCode, payInfo?.chg_id);
        cnt = cnt + 1
        // 한번 전체 완료된 건은 나중에 다시 잡히지 않도록 플래그를 바꿔준다.
        payInfo.autoRefundYn = "Y"
        await payInfo.save()
      }
    }
    return cnt;
  } catch (error) {
    console.error('환불 요청 중 에러가 발생했습니다:', error);
  }
}

module.exports = {
  processRefund
}
