/**
 * Created by SeJin Kim on 2023-08-31
 * BE -> Request -> OCPP
 * 충전기 운영 상태 변경
 * Change charger operational status
 */

const axios = require('axios');
const { configuration } = require('../../config/config');

/*
    추후 환경변수에서 OCPP 주소 가져와야 함
    OCPP address must be obtained from future environment variables
*/
const OCPP_URL = configuration()?.ocppServerUrl;

const changeAvailability = async ({ cid, connectorId, type }) => {
  const URL = `${OCPP_URL}changeAvailability/${cid}`;

  /*  Request
      cid – String 충전기 인덱스 
      connectorId – int 0 (전체), >= 0 (개별) 
      type – String Operative (운영), Inoperative (운영중지)
  */ 

    const requestData = {
      cid: cid,
      connectorId: connectorId,
      type: type,
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

module.exports = changeAvailability;
