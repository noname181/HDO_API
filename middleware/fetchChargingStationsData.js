/**
 * Created by 정인주 책임 2023-05.
 * Migrated by 배연진 책임 2023-06-02.
 * 환경부 API를 이용해서 데이터 조회
 */

const axios = require('axios');
const MAX_RETRIES = 10; // 최대 재시도 횟수
// const RETRY_DELAY = 1000; // 재시도 사이의 지연 시간 (밀리초)
const RETRY_DELAY_MIN = 1000; // 최소 재시도 사이의 지연 시간 (밀리초)
const RETRY_DELAY_MAX = 1500; // 최대 재시도 사이의 지연 시간 (밀리초)
const RETRY_DELAY = Math.random() * (RETRY_DELAY_MAX - RETRY_DELAY_MIN) + RETRY_DELAY_MIN;
const serviceKey = process.env.ME_API_SERVICE_KEY;

const apiUrl = 'http://apis.data.go.kr/B552584/EvCharger/getChargerInfo';

async function fetchChargingStationsData(pageNo, numOfRows) {
  let retries = 0;
  while (true) {
    try {
      const startTime = new Date();
      let requestUrl = `${apiUrl}?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}`;
      const apiResponse = await axios.get(requestUrl, { timeout: 0 });
      const data = apiResponse.data;
      console.log(`Received data for page ${pageNo}:`, data);

      if (!data || !data.header[0] || !data.items[0]) {
        throw new Error('Invalid or empty API response');
      }

      const endTime = new Date();
      console.log(`Time taken for page ${pageNo}: ${(endTime - startTime) / 1000} seconds`);
      return data; // 데이터가 유효하면 반환
    } catch (error) {
      console.error(`Error fetching data for page ${pageNo}: ${error}`);
      retries += 1;
      if (retries > MAX_RETRIES) {
        throw new Error(`Failed to fetch data after ${MAX_RETRIES} retries`);
      }
      console.log(`Retrying page ${pageNo} after ${RETRY_DELAY / 1000} seconds (Attempt ${retries}/${MAX_RETRIES})...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY)); // 지연 후 재시도
    }
  }
}

module.exports = fetchChargingStationsData;
