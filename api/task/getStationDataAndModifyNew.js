/**
 * Created by 정인주 책임 2023-012.
 * 환경부 API를 통해 제공된 전기충전소 지점 정보를 우리 DB에 저장 후 일부 가공해서 참조할 DB에 저장하는 Task API
 * 일정 주기별 수행
 */

// 첫번째 과정 - 환경부 api fetching + 첫 테이블(
    'use strict';

    const models = require('../../models');
    const { Sequelize, QueryTypes } = require('sequelize');
    const fetchChargingStationsData = require('../../middleware/fetchChargingStationsData');
    
    async function getStationDataAndModifyNew(_request, _response, next) {
      // const transaction = await models.sequelize.transaction();

      try {
        //header 정보를 가져오기 위해 데이터 조회
        const headerData = await fetchChargingStationsData(1, 10);
        const totalData = headerData.header[0].totalCount;

        //전체 데이터양을 기준으로 pageNo와 numOfRows 결정
        // 페이지 수 만큼 반복
        const totalPage = Math.ceil(totalData / 9000);
        console.log('총 페이지수 :', totalPage);

        // 데이터를 받을 배열
        const allChargingStations = [];

        // 모든 페이지의 데이터를 받아와서 배열에 추가
        for (let i = 1; i <= totalPage; i++) {
          const data = await fetchChargingStationsData(i, 9000);
          const chargingStations = await data.items[0].item;
          allChargingStations.push(...chargingStations);
        }

        // 대량 삽입을 위한 로직 시작
        const chunkSize = 9000;
        const chunks = [];
        const startChunkTime = new Date();
        // chunks.push(allChargingStations.slice(0,100));
        for (let i = 0; i < allChargingStations.length; i += chunkSize) {
          chunks.push(allChargingStations.slice(i, i + chunkSize));
        }
        const endChunkTime = new Date();
        console.log('chunk 걸린 시간 : ', calculateDuration(startChunkTime, endChunkTime));

        await models.sequelize.transaction(async (transaction) => {
          // All of these data replacements should be done in an instant and rolled back together in case of failure.

          // Refresh EnvCharger
          const EnvChargersTempStartTime = new Date();
          let lat;
          let lng;
          await models.sequelize.query('TRUNCATE TABLE EnvChargersTemp;',
              {
                type: QueryTypes.DELETE,
                transaction: transaction,
              });
          for (const chunk of chunks) {
            const values = chunk.map((stationData) => {
              lat = stationData.lat;
              lng = stationData.lng;
              return [
                stationData.statNm,
                stationData.statId,
                stationData.chgerId,
                stationData.chgerType,
                stationData.addr,
                stationData.lat,
                stationData.lng,
                stationData.busiId,
                stationData.bnm,
                stationData.stat,
                stationData.statUpdDt,
                stationData.nowTsdt,
                stationData.output,
                stationData.method,
                stationData.parkingFree,
                stationData.note,
                stationData.limitYn,
                stationData.limitDetail,
              ];
            });
            const query = `
                        INSERT INTO EnvChargersTemp 
                            ( statNm, 
                            statId, 
                            chgerId, 
                            chgerType, 
                            addr,  
                            lat, 
                            lng,  
                            busiId, 
                            bnm,    
                            stat, 
                            statUpdDt,  
                            nowTsdt, 
                            output, 
                            method,  
                            parkingFree, 
                            note, 
                            limitYn, 
                            limitDetail ) 
                            VALUES :valueData`;
            await models.sequelize.query(query, {
              replacements: { valueData: values },
              type: QueryTypes.INSERT,
              logging: false,
              transaction: transaction,
            });
          }

          const EnvChargersTempEndTime = new Date();
          console.log('EnvChargersTemp 걸린 시간', calculateDuration(EnvChargersTempStartTime, EnvChargersTempEndTime));

          const EnvChargersRenameStartTime = new Date();
          await models.sequelize.query('ALTER TABLE EnvChargers RENAME EnvChargersTempT;',{
            type: QueryTypes.UPDATE,
            transaction: transaction,
          });
          await models.sequelize.query('ALTER TABLE EnvChargersTemp RENAME EnvChargers;',{
            type: QueryTypes.UPDATE,
            transaction: transaction,
          });
          await models.sequelize.query('ALTER TABLE EnvChargersTempT RENAME EnvChargersTemp;',{
            type: QueryTypes.UPDATE,
            transaction: transaction,
          });
          const EnvChargersRenameEndTime = new Date();
          console.log('EnvChargersRename 걸린 시간', calculateDuration(EnvChargersRenameStartTime, EnvChargersRenameEndTime));


          // Refresh EnvChargeStations
          const EnvChargerStationsTempStartTime = new Date();
          await models.sequelize.query('TRUNCATE TABLE EnvChargeStationsTemp;',
              {
                type: QueryTypes.DELETE,
                transaction: transaction,
              });
          await models.sequelize.query(
              ` INSERT INTO EnvChargeStationsTemp  
           (
               busiId, statNm, statId, chgerType, addr, coordinate, lat, lng, method, parkingFree, limitDetail, note,
               stat, output3, output7, output50, output100, output200, chgerType1, chgerType2, chgerType3, chgerType4, chgerType5, chgerType6, chgerType7, limitYn
           )  
            SELECT  
                T1.busiId, T1.statNm, T1.statId, T1.chgerType, T1.addr, ST_GEOMFROMTEXT(CONCAT('POINT(', T1.lng, ' ', T1.lat, ')')), T1.lat, T1.lng, T1.method, T1.parkingFree, T1.limitDetail, T1.note,
                MAX(CASE WHEN T2.stat = 2 THEN T2.stat END),
                MAX(CASE WHEN T2.output = 3 THEN 1 END),
                MAX(CASE WHEN T2.output = 7 THEN 1 END),
                MAX(CASE WHEN T2.output = 50 THEN 1 END),
                MAX(CASE WHEN T2.output = 100 THEN 1 END),
                MAX(CASE WHEN T2.output = 200 THEN 1 END),
                MAX(CASE WHEN T2.chgerType = 1 THEN 1 END),
                MAX(CASE WHEN T2.chgerType = 2 THEN 1 END),
                MAX(CASE WHEN T2.chgerType = 3 THEN 1 END),
                MAX(CASE WHEN T2.chgerType = 4 THEN 1 END),
                MAX(CASE WHEN T2.chgerType = 5 THEN 1 END),
                MAX(CASE WHEN T2.chgerType = 6 THEN 1 END),
                MAX(CASE WHEN T2.chgerType = 7 THEN 1 END),
                MIN(T2.limitYn)
            FROM 
                EnvChargers T1 
            LEFT JOIN 
                EnvChargers T2 ON T1.statId = T2.statId
            GROUP BY 
                T1.statId 
        `,
              {
                type: QueryTypes.INSERT,
                transaction: transaction,
              }
          );
          const EnvChargerStationsTempEndTime = new Date();
          console.log('EnvChargerStationsTemp 걸린 시간', calculateDuration(EnvChargerStationsTempStartTime, EnvChargerStationsTempEndTime));

          const EnvChargerStationsTempRenameStartTime = new Date();
          await models.sequelize.query('ALTER TABLE EnvChargeStations RENAME EnvChargeStationsTempT;',{
            type: QueryTypes.UPDATE,
            transaction: transaction,
          });
          await models.sequelize.query('ALTER TABLE EnvChargeStationsTemp RENAME EnvChargeStations;',{
            type: QueryTypes.UPDATE,
            transaction: transaction,
          });
          await models.sequelize.query('ALTER TABLE EnvChargeStationsTempT RENAME EnvChargeStationsTemp;',{
            type: QueryTypes.UPDATE,
            transaction: transaction,
          });
          const EnvChargerStationsTempRenameEndTime = new Date();
          console.log('EnvChargerStationsRename 걸린 시간', calculateDuration(EnvChargerStationsTempRenameStartTime, EnvChargerStationsTempRenameEndTime));

        })
      } catch (e) {
        // Log the error for debugging purposes
        console.error('error::::::', e?.stack);
        throw e
      }
    }
    
    // 시간 계산
    function calculateDuration(startTime, endTime) {
      const duration = endTime - startTime;
      return duration / 1000;
    }
    
    module.exports = {
      getStationDataAndModifyNew,
    };
    