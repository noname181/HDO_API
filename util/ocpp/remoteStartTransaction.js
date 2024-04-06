/**
 * Created by SeJin Kim on 2023-08-31
 * BE -> Request -> OCPP
 * 충전 시작을 충전기로 요청
 * Request charging start to charger
 */

const axios = require("axios");
const { configuration } = require('../../config/config');
/*
    추후 환경변수에서 OCPP 주소 가져와야 함
    OCPP address must be obtained from future environment variables
*/
const OCPP_URL = configuration()?.ocppServerUrl;

const remoteStartTransaction = async ({ cid, vendorId, connId, idTag, kwh, amount, unitPrice, targetSoc }) => {
  const URL = `${OCPP_URL}remoteStartTransaction/${cid}`;
 
  /*  Request
        cid – String 충전기 인덱스
        vendorId – String 벤더 아이디
        connId – int 커넥터 인덱스 (1, 2)
        idTag – String
        kwh – int 요청 충전용량
        amount – int 결제금액
        unitPrice – int 단가
        targetSoc - 목표충전량
*/ 
 
      const requestData = {
        cid,
        vendorId,
        connId,
        idTag,
        kwh,
        amount,
        unitPrice,
        targetSoc
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

  module.exports = remoteStartTransaction;