/**
 * Created by SeJin Kim on 2023-08-31
 * BE -> Request -> OCPP
 * 비표준 데이터 전송
 * Non-standard data transfer
 */

const axios = require('axios');
const { configuration } = require('../../config/config');

/*
    추후 환경변수에서 OCPP 주소 가져와야 함
    OCPP address must be obtained from future environment variables
*/
const OCPP_URL = configuration()?.ocppServerUrl;

const transferNonStandardData = async ({ cid, vendorId, messageId, data}) => {
  const URL = `${OCPP_URL}dataTransfer/${cid}`;

  /*  Request
        cid – String 충전기 인덱스 
        vendorId – String ex) com.klinelex 
        messageId – String 비표준 메세지 
        data – JSON 형식 {"unitNMPrice":"500","unitMPrice":"400","deposit":"5000"}
*/ 
 
    const requestData = {
      cid: cid,
      vendorId: vendorId,
      messageId: messageId,
      data: data
    };

  // console.log('URL----->', URL)
  // console.log('requestData----->', requestData)

  try {
    const timeout = messageId === 'sendUnitPrice' ? 300000 : 5000; // 5 seconds

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

module.exports = transferNonStandardData;
