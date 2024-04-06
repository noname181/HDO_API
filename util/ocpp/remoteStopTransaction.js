const axios = require("axios");
const { configuration } = require('../../config/config');
/*
    추후 환경변수에서 OCPP 주소 가져와야 함
    OCPP address must be obtained from future environment variables
*/
const OCPP_URL = configuration()?.ocppServerUrl;

const remoteStopTransaction = async ({ cid, vendorId, connId, transId }) => {
  const URL = `${OCPP_URL}remoteStopTransaction/${cid}`;
 
  /*  Request
            cid – String 충전기 인덱스 
            vendorId – String   벤더 아이디
            connId – int  커넥터 인덱스
            transId – String    트랜잭션 아이디
    */ 

    const requestData = {
      cid: cid,
      vendorId: vendorId,
      connId: connId,
      transId: transId,
    };

    // console.log('URL----->', URL)
    // console.log('requestData----->', requestData)
    
      try {
        const timeout = 5000; // 5 seconds
    
        const response = await axios.post(URL, requestData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout,
        });
    
        // Check the response status and handle accordingly
        if (response.status !== 200) {
          return 'CONNECT_OCPP_FAILED';  
        }
        return response.data;
      } catch (error) {
        if (axios.isCancel(error)) {
          return 'CONNECT_OCPP_FAILED_TIMEOUT';
        } else {
          return 'CONNECT_OCPP_FAILED';
        }
      }
       
  };

  module.exports = remoteStopTransaction;