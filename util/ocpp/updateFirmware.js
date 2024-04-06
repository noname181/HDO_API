/**
 * Created by SeJin Kim on 2023-08-31
 * BE -> Request -> OCPP
 * 충전기로 펌웨어 업데이트 전송
 * Send firmware updates to the charger
 */

const axios = require('axios');
const { configuration } = require('../../config/config');

/*
    추후 환경변수에서 OCPP 주소 가져와야 함
    OCPP address must be obtained from future environment variables
*/
const OCPP_URL = configuration()?.ocppServerUrl;

const updateFirmware = async ({ cid, location }) => {
  const URL = `${OCPP_URL}updateFirmware/${cid}`;

  /*  Request
        cid – String 충전기 인덱스 
        location – String 펌웨어 경로 (http, https, ftp : ftp://아이디:암호@호스트/파일경로)
*/ 
  const requestData = {
    cid,
    location
  };

  console.log('URL----->', URL)
  console.log('requestData----->', requestData)

  try {
    const timeout = 60000; // 60 seconds

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

module.exports = updateFirmware;
