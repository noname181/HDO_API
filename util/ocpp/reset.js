/**
 * Created by SeJin Kim on 2023-08-31
 * BE -> Request -> OCPP
 * 충전기 리셋을 요청
 * Request to reset the charger
 */

const axios = require('axios');
const { configuration } = require('../../config/config');

/*
 * 추후 환경변수에서 OCPP 주소 가져와야 함
 * OCPP address must be obtained from future environment variables
 */
const OCPP_URL = configuration()?.ocppServerUrl;

const reset = async ({ cid, type }) => {
  // Construct the URL for reset
  const URL = `${OCPP_URL}reset/${cid}`;

  /* Request
   * cid – String 충전기 인덱스 
   * type – String Hard or Soft
   */ 
  const requestData = {
    cid,
    type,
  };

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

module.exports = reset;
