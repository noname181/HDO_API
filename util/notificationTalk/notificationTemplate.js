/**
 * EVNU 회원가입 -
 *    param: 고객 이름, 회원가입일,
 * @param {string} userName
 * @param {string} joinDate
 * @param {string} callNum
 * return : tempData.templateCode, tempData.message
 */

function sendRegCmpMsg(userName, joinDate, callNum) {
  const templateCode = 'EV_AA_012';

  const message = `[EV&U] 안녕하세요. 

  ${userName}고객님 
   
   EV&U 회원가입이 완료되었습니다.
   회원가입일 : ${joinDate}
   본인의 의사와 상관없이 회원가입된 경우 
   고객센터 ${callNum}로 문의해주세요.`;

  const tempData = {
    templateCode: templateCode,
    message: message,
    button: [
      {
        name: '채널 추가',
        type: 'AC',
      },
    ],
  };

  return tempData;
}

/**
 * 환불 내역 안내 -
 *    param: 충전 시작 시간, 충전 종료 시간, 충전소ID,
 *           충전 결제 금액, 총 환불 금액, 최종 결제 금액, 콜센터 번호
 * @param {string} startChargeTime
 * @param {string} endChargeTime
 * @param {string} chargeId
 * @param {string} chargingPrice
 * @param {string} totalRefunPrice
 * @param {string} comPrice
 * @param {string} callCenNum
 * return : tempData.templateCode, tempData.message
 */

function sendRefMsg(startChargeTime, endChargeTime, chargeId, chargingPrice, totalRefunPrice, comPrice, callCenNum) {
  const templateCode = 'EV_BB_03';

  const message = `[EV&U] 환불 내역 입니다. 
  충전시작: [ ${startChargeTime} ]
  충전종료: [ ${endChargeTime} ]
  충전소ID: [ ${chargeId} ]
 [결제 내역]
  충전 결제 금액 : ${chargingPrice} 원 
 
 [환불 내역]
  총환불 금액 : ${totalRefunPrice} 원 
  최종 결제 금액: ${comPrice} 원 
 
  취소 금액은 카드사에 따라 2~3일 
  영업일 이후 
  한도에 반영될 수도 있습니다.
 
  
 
  고객센터 ${callCenNum}
 
 -HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

/**
 * 충전 시작 안내 비회원-
 *    param: 충전기 ID, 충전 요구량, 충전 완료 예상 시간, 콜 센터
 * @param {string} chargerId
 * @param {string} chargingAmount
 * @param {string} comEstTime
 * @param {string} callCenNum
 * return : tempData.templateCode, tempData.message
 */

function sendChgStrtMsgNon(chargerId, chargingAmount, comEstTime, callCenNum) {
  const templateCode = 'EV_BA_03';

  const message = `[EV&U]

  충전소ID: [${chargerId}]

  고객님의 차량에 충전이 시작되었습니다.
 
  충전 요구량 : ${chargingAmount}kWh
  충전 완료 예상 시간 : ${comEstTime}
 
  차량 배터리의 보호를 위해 
  최대 80%만 충전이 가능합니다.
 
  충전 완료 후 남은 금액은 
  자동 부분 취소 처리됩니다.
 
  EV&U 고객센터 ${callCenNum}
 
 -HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}



/**
 * 충전 시작 안내 회원-
 *    param: 충전기 ID, 충전 요구량, 충전 완료 예상 시간, 콜 센터
 * @param {string} chargerId
 * @param {string} chargingAmount
 * @param {string} comEstTime
 * @param {string} callCenNum
 * return : tempData.templateCode, tempData.message
 */

function sendChgStrtMsgMem(chargerId, chargingAmount, comEstTime, callCenNum) {
  const templateCode = 'EV_BA_04';

  const message = `[EV&U]

  충전소ID: [${chargerId}]
  
  고객님의 차량에 충전이 시작되었습니다.
 
  충전 요구량 : ${chargingAmount}kWh
  충전 완료 예상 시간 : ${comEstTime}
 
  차량 배터리의 보호를 위해 
  최대 80%만 충전이 가능합니다.
 
  충전 완료 후 남은 금액은 
  등록된 카드로 자동 결제됩니다. 
 
  EV&U 고객센터 ${callCenNum}
 
 -HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

/**
 * 자동 취소 안내 -
 *    param: 충전 요구량, 충전 완료 예상 시간, 콜 센터
 * @param {string} refundPrice
 * return : tempData.templateCode, tempData.message
 */

function sendRefundMsg(refundPrice) {
  const templateCode = 'EV_BB_02';

  const message = `[EV&U] 자동 취소 안내.

  충전 미시작으로 인해 
  ${refundPrice}원 취소 되었습니다.
  
  -HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

/**
 * 충전 완료 안내 -
 *    param: 충전 완료 시간, 총 충전량, 충전 단가, 충전 금액
 * @param {string} comChargingTime
 * @param {string} totalChargAmount
 * @param {string} unitPrice
 * @param {string} totalPrice
 * return : tempData.templateCode, tempData.message
 */

function sendComChgMsg(comChargingTime, totalChargAmount, unitPrice, totalPrice) {
  const templateCode = 'EV_BA_02';

  const message = `[EV&U] 충전이 완료되었습니다.
      
  충전 완료 시간 : ${comChargingTime}
  총 충전량 : ${totalChargAmount}kWh
  충전 단가 : ${unitPrice}원
  충전 금액 : ${totalPrice} 원
  
  플러그 제거시 남은 금액은 자동으로 부분취소 처리됩니다.
  
  -HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

function sendComChgMsgMem(comChargingTime, totalChargAmount, unitPrice, totalPrice) {
  const templateCode = 'EV_BA_07';

  const message = `[EV&U] 충전이 완료되었습니다.
      
  충전 완료 시간 : ${comChargingTime}
  총 충전량 : ${totalChargAmount}kWh
  충전 단가 : ${unitPrice}원
  충전 금액 : ${totalPrice} 원
  
  플러그를 제거해 주시면 결제를 진행합니다.
  10분이상 미출차시 추가요금이 발생합니다.
  
  -HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

/**
 * 충전 결제 내역 안내 -
 *    param: 충전 금액, 총 충전량, 충전 단가, 충전 금액, 충전 완료, 취소 금액, 최종 결재 금액, 고객센터 전화번호
 * @param {string} comChargingTime
 * @param {string} totalChargAmount
 * @param {string} unitPrice
 * @param {string} totalPrice
 * @param {string} chargeCom
 * @param {string} cancelPrice
 * @param {string} finalPrice
 * @param {string} callCenNum
 * return : tempData.templateCode, tempData.message
 */

function sendChgHisMsg(
  comChargingTime,
  totalChargAmount,
  unitPrice,
  totalPrice,
  chargeCom,
  cancelPrice,
  finalPrice,
  callCenNum
) {
  const templateCode = 'EV_BC_02';

  const message = `[EV&U] 충전 결제 내역 입니다.

  [선결제 내역]
  충전 금액 : ${comChargingTime}원
  
  [충전 내역]
  총 충전량 : ${totalChargAmount}kWh
  충전 단가 : ${unitPrice}원
  충전 금액 : ${totalPrice} 원
  충전 완료 : ${chargeCom}
  
  [결제 내역]
  취소 금액 : ${cancelPrice} 원
  최종 결제 금액 : ${finalPrice} 원
  
  취소금액은 카드사에 따라 2~3 영업일 이후에 한도에 반영될수도 있습니다.
  
  다른 고객의 충전을 위하여 차량을 이동해주세요.
  
  고객센터 ${callCenNum}
  
  -HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

/**
 * 기타 충전 종료 안내
 * @param {string} chargerId
 * @param {string} reasonStr
 * @param {string} reasonCode
 * @param {string} callCenNum
 * @returns {{templateCode: string, message: string}}
 */
function sendStopReasonEtcMsg(chargerId, reasonStr, reasonCode, callCenNum) {
  const templateCode = 'EV_BA_05';

  const message = `[EV&U] 충전이 종료되었습니다.

충전소ID: [${chargerId}]

사유 : ${reasonStr}
종료코드 : ${reasonCode}
        
고객센터 ${callCenNum}
        
-HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

/**
 * 기타 충전 종료 안내
 * @param {string} amount
 * @param {string} callCenNum
 * @returns {{templateCode: string, message: string}}
 */
function sendPartCancelFailedMsg(amount, callCenNum) {
  const templateCode = 'EV_BD_02';

  const message = `[EV&U] 부분 취소가 실패하였습니다.

[ 결제 내역 ]
충전 결제 내역 : ${amount}원


고객센터 ${callCenNum}

-HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

/**
 *
 * @param {string} resetPassword
 * @returns {{templateCode: string, message: string}}
 */
function sendResetPassWordMsg(resetPassword) {
  const templateCode = 'EV_AB_01';

  const message = `[EV&U] 비밀번호 초기화

비밀번호 초기화 요청에 따라 계정의 비밀번호가 초기화되었습니다. 

새로운 비밀번호: ${resetPassword}

보안을 위해 로그인 후 반드시 비밀번호를 변경해 주시기 바랍니다. 

감사합니다.

-HD현대오일뱅크-`;

  const tempData = {
    templateCode: templateCode,
    message: message,
  };

  return tempData;
}

module.exports = {
  sendRegCmpMsg: sendRegCmpMsg,
  sendRefMsg: sendRefMsg,
  sendChgStrtMsgNon: sendChgStrtMsgNon,
  sendChgStrtMsgMem: sendChgStrtMsgMem,
  sendRefundMsg: sendRefundMsg,
  sendComChgMsg: sendComChgMsg,
  sendComChgMsgMem: sendComChgMsgMem,
  sendChgHisMsg: sendChgHisMsg,
  sendStopReasonEtcMsg: sendStopReasonEtcMsg,
  sendPartCancelFailedMsg: sendPartCancelFailedMsg,
  sendResetPassWordMsg: sendResetPassWordMsg,

};
