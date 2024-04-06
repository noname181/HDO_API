/**
 * Created by SeJin Kim on 2023-08-31
 * BE -> Request -> OCPP
 * 충전기의 진단정보 업로드 요청
 * Request to upload the diagnostic information of the charger
 */

const axios = require('axios');
const { configuration } = require('../../config/config');

/*
    추후 환경변수에서 OCPP 주소 가져와야 함
    OCPP address must be obtained from future environment variables
*/
const OCPP_URL = configuration()?.ocppServerUrl;

const getDiagnostics = async ({ cid, location, retries, retryInterval, startTime, stopTime }) => {
  const URL = `${OCPP_URL}getDiagnostics/${cid}`;

  /*  Request
        cid – String 충전기 인덱스 
        location – String 진단정보 업로드 경로 (put https://경로명)
        retries – int 재시도 횟수 
        retryInterval – int 재시도 간격 
        startTime – String 업로드 시작시간 
        stopTime – String 업로드 종료시간
*/ 

  const requestData = {
    cid: cid,
    location: location,
    retries: retries,
    retryInterval: retryInterval,
    startTime: startTime,
    stopTime: stopTime,
  };

  console.log('URL----->', URL)
  console.log('requestData----->', requestData)

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

module.exports = getDiagnostics;
