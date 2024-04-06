const axios = require('axios');
const crypto = require('crypto');
const cryptor = require('./cryptor');
const { getKoreanDate } = require('./common-util');

async function payRequestFromKICC(totalPrice, kBillingKey, mallId = process.env.EASYPAY_MALL_ID, isRetry = false) {
  try {
    const transactionID = 'refund-' + createTransactionID(getKoreanDate());
    const shopOrderNo = 'order-' + transactionID;
    console.log('결제요청 KICC_MALL_ID', mallId || process.env.EASYPAY_MALL_ID || '05574880');
    console.log('결제요청 totalPrice', totalPrice);
    const data = {
      mallId: mallId || process.env.EASYPAY_MALL_ID || '05574880',
      shopTransactionId: transactionID,
      shopOrderNo: shopOrderNo,
      amount: totalPrice,
      approvalReqDate: formatDate(new Date()),
      payMethodInfo: {
        billKeyMethodInfo: {
          batchKey: kBillingKey,
        },
      },
      orderInfo: {
        goodsName: '차량 충전',
      },
    }
    if (isRetry) {
      data["shopValueInfo"] = {
        value1 : "Y"
      }
    }
    console.log('결제요청 data', data);
    const payResponse = await axios({
      url: process.env.KICC_REQ_BILLING_PAY || 'https://pgapi.easypay.co.kr/api/trades/approval/batch',
      method: 'POST',
      data: data
    });
    return payResponse.data;
  } catch (e) {
    return e.response ? e.response.data : e.message;
  }
}
async function refundRequestFromKICC(
  refundAmount,
  pgCno,
  mallId = process.env.EASYPAY_MALL_ID,
  inputTransactionID = '0',
  encKey = process.env.KICC_REQ_BILLING_SECRET_KEY,
  cancelReqDate = formatDate(getKoreanDate())
) {
  try {
    /**
     * 부분취소, 환불등 변경은 mallId와 pgCno, msgAuthValue만 맞으면 가능하다.
     * pgCno는 유일한 값이라고 한다. 다른 검증은 필요하지 않다.
     */
    if (mallId === '05574880') {
      encKey = process.env.KICC_REQ_BILLING_SECRET_KEY;
    } else {
      encKey = process.env.KICC_REQ_BILLING_SECRET_KEY_MALL;
    }
    const decKey = cryptor.decrypt(encKey);
    let transactionID = null;
    if (inputTransactionID === '0') {
      transactionID = 'refund-' + createTransactionID(getKoreanDate());
    } else {
      transactionID = inputTransactionID;
    }
    const msgAuthValue = getMsgAuthValue(pgCno, transactionID, decKey);
    console.log('부분취소 요청 가맹점 MALL_ID - 매개변수 || 조건이후 값 : ', mallId || '05574880');
    console.log('부분취소 요청 pgCno : ', pgCno);

    const refundResponse = await axios({
      url: process.env.KICC_REQ_BILLING_REFUND || 'https://pgapi.easypay.co.kr/api/trades/revise',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        mallId: mallId || process.env.EASYPAY_MALL_ID || '05574880',
        pgCno: pgCno,
        shopTransactionId: transactionID,
        msgAuthValue: msgAuthValue,
        amount: refundAmount,
        reviseTypeCode: '32',
        clientIp: process.env.EASYPAY_API_SERVER_HOST || '3.36.206.91',
        clientId: 'HDO',
        cancelReqDate: formatDate(getKoreanDate()),
      },
    });

    return refundResponse.data;
  } catch (e) {
    return e.response ? e.response.data : e.message;
  }
}

async function refundALLRequestFromKICC(
  pgCno,
  mallId = process.env.EASYPAY_MALL_ID,
  inputTransactionID = '0',
  encKey = process.env.KICC_REQ_BILLING_SECRET_KEY,
  cancelReqDate = formatDate(getKoreanDate())
) {
  /***
     Param
     mallId
     shopTransactionId
     pgCno
     reviseTypeCode
     clientIp
     clientId
     msgAuthValue
     cancelRegDate

     refundInfo : {
        refundBankCode, - 환불계좌 은행코드
        refundAccountNo, - 환불계좌 계좌번호
        refundDepositName - 환불계좌 예금주명
        }
     amount
     */

  try {
    /**
     * 부분취소, 환불등 변경은 mallId와 pgCno, msgAuthValue만 맞으면 가능하다.
     * pgCno는 유일한 값이라고 한다. 다른 검증은 필요하지 않다.
     */
    if (mallId === '05574880') {
      encKey = process.env.KICC_REQ_BILLING_SECRET_KEY;
    } else {
      encKey = process.env.KICC_REQ_BILLING_SECRET_KEY_MALL;
    }
    const decKey = cryptor.decrypt(encKey);
    let transactionID = null;
    if (inputTransactionID === '0') {
      transactionID = 'refund-' + createTransactionID(getKoreanDate());
    } else {
      transactionID = inputTransactionID;
    }
    const msgAuthValue = getMsgAuthValue(pgCno, transactionID, decKey);
    console.log('전체취소 요청 가맹점 MALL_ID - 매개변수 || 조건이후 값 : ', mallId || '05574880');
    console.log('전체취소 요청 pgCno : ', pgCno);

    const refundResponse = await axios({
      url: process.env.KICC_REQ_BILLING_REFUND || 'https://pgapi.easypay.co.kr/api/trades/revise',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        mallId: mallId || process.env.EASYPAY_MALL_ID || '05574880',
        pgCno: pgCno,
        shopTransactionId: transactionID,
        msgAuthValue: msgAuthValue,
        reviseTypeCode: '40',
        clientIp: process.env.EASYPAY_API_SERVER_HOST || '3.36.206.91',
        clientId: 'HDO',
        cancelReqDate: cancelReqDate,
      },
    });

    return refundResponse.data;
  } catch (e) {
    return e.response ? e.response.data : e.message;
  }
}

// 고유한 환불 트랜잭션 ID의 생성을 보장하는 함수
// 주문에 대하여 유일한 값을 만들어야 한다.
// 현재 타임스탬프를 이용한 값을 만든다.
function createTransactionID(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(date.getFullYear()).slice(2);
  const postfix = String(date.getTime());
  return `${year}${month}${day}-tr-${postfix}`;
}

// 환불 승인날짜 생성 함수
// example: 20230809
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// HMAC SHA-256 암호화 함수
// 이 환불에 대한 주문 트랜잭션 또한 환불 주문에 대하여 유일해야 한다.
// 최초 주문을 만들때 썼던 타임값을 포스트픽스로 쓰는 트랜잭션ID 생성법을 쓰면 고유값은 보장할 수 있다.
// 이 암호화문자열을 만드는 함수는 결국 decKey와 pgCno만 검증되면 환불승인을 해준다.
function getMsgAuthValue(pgCno, transactionID, decKey) {
  const hmac = crypto.createHmac('sha256', decKey);
  hmac.update(pgCno + '|' + transactionID);
  return hmac.digest('hex');
}

module.exports = {
  payRequestFromKICC,
  refundRequestFromKICC,
  refundALLRequestFromKICC,
  createTransactionID,
  formatDate,
  getMsgAuthValue,
};
