/**
 * Created by SeJin Kim on 2023-08-31
 * BE -> Request -> OCPP
 * 충전기로 특정 명령어 전송
 * Send specific commands to the charger
 */

const axios = require('axios');
const { configuration } = require('../../config/config');

/*
    추후 환경변수에서 OCPP 주소 가져와야 함
    OCPP address must be obtained from future environment variables
*/
const OCPP_URL = configuration()?.ocppServerUrl;

const triggerMessage = async ({ cid, connId, trigger }) => {
  const URL = `${OCPP_URL}triggerMessage/${cid}`;

  /*  Request
        cid – String 충전기 인덱스 
        connId – int 커넥터 인덱스 (1, 2) 
        trigger – String 트리거 메세지 이름 (BootNotification, DiagnosticsStatusNotification, FirmwareStatusNotification, Heartbeat, MeterValues, StatusNotification)
*/ 


  const requestData = {
    cid: cid,
    connId: connId,
    trigger: trigger,
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

module.exports = triggerMessage;
