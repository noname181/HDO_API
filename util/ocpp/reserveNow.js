/**
 * Created by SeJin Kim on 2023-08-31
 * BE -> Request -> OCPP
 * 지정된 충전기로 예약 등록
 * Register a reservation with the specified charger
 */

const axios = require('axios');
const { configuration } = require('../../config/config');

/*
    추후 환경변수에서 OCPP 주소 가져와야 함
    OCPP address must be obtained from future environment variables
*/
const OCPP_URL = configuration()?.ocppServerUrl;

const reserveNow = async ({ cid, vendorId, connId, idTag, reservationId, expiryDate }) => {
  const URL = `${OCPP_URL}reserveNow/${cid}`;

  /*  Request
        cid – String 충전기 인덱스 
        vendorId – String 벤더 아이디 
        connId – int 커넥터 인덱스 (1, 2) 
        idTag – String 
        reservationId – int 예약 번호 
        expiryDate – String 만료일자
*/ 
  const requestData = {
    cid: cid,
    vendorId: vendorId,
    connId: connId,
    idTag: idTag,
    reservationId: reservationId,
    expiryDate: expiryDate,
  };

  // console.log('URL----->', URL)
  // console.log('requestData----->', requestData)

  try {
    const timeout = 5000; // 5 seconds

    return await axios.post(URL, requestData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: timeout
    }).then((response) => {
      if (response.status === 200) {
        response.data
      } else {
        return 'CONNECT_OCPP_FAILED';
      }
      return response.data;
    }).catch((error) => {
      if (error.code === 'ECONNABORTED') {
        return 'CONNECT_OCPP_FAILED_TIMEOUT';
      } else {
        return 'CONNECT_OCPP_FAILED';
      }
    });
  } catch(error){
    return 'CONNECT_OCPP_FAILED';
  }
};

module.exports = reserveNow;
