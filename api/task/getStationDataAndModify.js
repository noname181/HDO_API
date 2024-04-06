/**
 * Created by 정인주 책임 2023-012.
 * 환경부 API를 통해 제공된 전기충전소 지점 정보를 우리 DB에 저장 후 일부 가공해서 참조할 DB에 저장하는 Task API
 * 일정 주기별 수행
 */

// 첫번째 과정 - 환경부 api fetching + 첫 테이블(
'use strict';

const models = require('../../models');
const { Sequelize } = require('sequelize');
const fetchChargingStationsData = require('../../middleware/fetchChargingStationsData');

async function getStationDataAndModify(_request, _response, next) {
  const transaction = await models.sequelize.transaction();

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

    const startDataInsert = new Date();
    console.log('데이터 삽입 시작 : ', startDataInsert);

    // 모든 페이지의 데이터를 받아와서 배열에 추가
    for (let i = 1; i <= totalPage; i++) {
      const data = await fetchChargingStationsData(i, 9000);
      const chargingStations = await data.items[0].item;
      allChargingStations.push(...chargingStations);
    }

    await models.EnvChargerOrg.destroy({
      where: {},
      truncate: true,
      transaction: transaction,
    });

    await models.EnvChargerTran.destroy({
      where: {},
      truncate: true,
      transaction: transaction,
    });

    await models.sequelize.query('ALTER TABLE EnvChargerOrgs AUTO_INCREMENT = 1;', { transaction: transaction });
    await models.sequelize.query('ALTER TABLE EnvChargerTrans AUTO_INCREMENT = 1;', { transaction: transaction });

    const endDataInsert = new Date();
    console.log('데이터 삽입 종료 : ', endDataInsert);

    console.log('데이터 삽입 종료 시간 : ', calculateDuration(startDataInsert, endDataInsert));

    // 대량 삽입을 위한 로직 시작
    const chunkSize = 9000;
    const chunks = [];
    const startChunkTime = new Date();
    for (let i = 0; i < allChargingStations.length; i += chunkSize) {
      chunks.push(allChargingStations.slice(i, i + chunkSize));
    }
    const endChunkTime = new Date();
    console.log('chunk 종료 시간 : ', calculateDuration(startChunkTime, endChunkTime));

    try {
      // 전체 시간 계산
      const startTime = new Date();
      /**============================================
       * Process #1. API GET ---------- ChargerEnvOrg
       * ============================================
       */
      const EnvChargerOrgsstartTime = new Date();
      const chunkSize = 1000; // 한 번에 처리할 청크 크기

      let lat;
      let lng;

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
            stationData.location,
            stationData.lat,
            stationData.lng,
            stationData.useTime,
            stationData.busiId,
            stationData.bnm,
            stationData.busiNm,
            stationData.busiCall,
            stationData.stat,
            stationData.statUpdDt,
            stationData.lastTsdt,
            stationData.lastTedt,
            stationData.nowTsdt,
            stationData.output,
            stationData.method,
            stationData.kind,
            stationData.kindDetail,
            stationData.parkingFree,
            stationData.note,
            stationData.limitYn,
            stationData.limitDetail,
          ];
        });
        const query = `
                    INSERT INTO EnvChargerOrgs 
                        ( statNm, 
                        statId, 
                        chgerId, 
                        chgerType, 
                        addr, 
                        location, 
                        lat, 
                        lng, 
                        useTime, 
                        busiId, 
                        bnm, 
                        busiNm, 
                        busiCall, 
                        stat, 
                        statUpdDt, 
                        lastTsdt, 
                        lastTedt, 
                        nowTsdt, 
                        output, 
                        method, 
                        kind, 
                        kindDetail, 
                        parkingFree, 
                        note, 
                        limitYn, 
                        limitDetail ) 
                        VALUES :valueData`;
        await models.sequelize.query(query, {
          replacements: { valueData: values },
          type: Sequelize.QueryTypes.INSERT,
          logging: false,
          transaction: transaction,
        });
      }

      const EnvChargerOrgsEndTime = new Date();
      const EnvChargerOrgsResultTime = calculateDuration(EnvChargerOrgsstartTime, EnvChargerOrgsEndTime);
      console.log('envChargerOrgs insert 걸린 시간', EnvChargerOrgsResultTime);

      /**============================================
       * Process #2 ---- ChargerEnvTrans → ChargerEnv
       * ============================================
       */
      const EnvChargerTransStartTime = new Date();
      const [TransChargerResult] = await models.sequelize.query(
        `
                    INSERT INTO EnvChargerTrans
                    (   statNm,
                        statId,
                        chgerId,
                        chgerType,
                        addr,
                        location,
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
                        limitDetail)
                    SELECT
                        statNm,
                        statId,
                        chgerId,
                        SUBSTRING(chgerType,2) AS chgerType,
                        addr,
                        location,
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
                        limitDetail
                    FROM EnvChargerOrgs
                    `,
        /***
                     *  CASE
                        WHEN stat = 1 THEN 'offline'
                        WHEN stat = 2 THEN 'ready'
                        WHEN stat = 3 THEN 'available'
                        ELSE stat
                        END AS stat,
    
                        추후 stat 코드값이 정해지면 위 형식으로 SQL 변경 요망.
                     */
        {
          type: Sequelize.QueryTypes.INSERT,
          transaction: transaction,
        }
      );
      // 충전기 타입 코드 변환 필요 ---> CodeLookUps 테이블 이용

      const EnvChargerTransEndTime = new Date();
      const EnvChargerTransResultTime = calculateDuration(EnvChargerTransStartTime, EnvChargerTransEndTime);
      console.log('EnvChargerTrans 총 걸린 시간 : ', EnvChargerTransResultTime);

      /**==================================================
       * Process #3-----------EvnChargerTrans → EvnChargers
       * ==================================================
       */

      console.log('EnvChargersTemp start');
      /*
      await models.EnvCharger.destroy({
        where: {},
        truncate: true,
        transaction: transaction,
      });
      */
      await models.sequelize.query('TRUNCATE TABLE EnvChargersTemp;', { transaction: transaction });
      const EnvChargersTempStartTime = new Date();
      console.log('시작 시간 : ', EnvChargersTempStartTime);

      const [resultChargersTemp] = await models.sequelize.query(
        `
                    INSERT INTO EnvChargersTemp
                    (statNm,
                        statId,
                        chgerId,
                        chgerType,
                        addr,
                        location,
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
                        limitDetail)
                    SELECT
                        statNm,
                        statId,
                        chgerId,
                        chgerType,
                        addr,
                        location,
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
                        limitDetail
                    FROM EnvChargerTrans
    
                    `,
        {
          type: Sequelize.QueryTypes.INSERT,
          transaction: transaction,
        }
      );

      console.log('EnvChargers end');
      const EnvChargersTempEndTime = new Date();
      console.log('종료 시간 : ', EnvChargersTempEndTime);
      console.log('EnvChargersTemp 걸린 시간', calculateDuration(EnvChargersTempStartTime, EnvChargersTempEndTime));

      const EnvChargersRenameStartTime = new Date();
      await models.sequelize.query('ALTER TABLE EnvChargers RENAME EnvChargersTempT;', { transaction: transaction });
      await models.sequelize.query('ALTER TABLE EnvChargersTemp RENAME EnvChargers;', { transaction: transaction });
      await models.sequelize.query('ALTER TABLE EnvChargersTempT RENAME EnvChargersTemp;', { transaction: transaction });
      const EnvChargersRenameEndTime = new Date();
      console.log('EnvChargersRename 걸린 시간', calculateDuration(EnvChargersRenameStartTime, EnvChargersRenameEndTime));
      /**========================================================
       * Process #4 ---------EnvChargers -> EnvChargeStationTrans
       * ========================================================
       */

      console.log('EnvChanrgeStationTrans start');
      const EnvChangerStationTransStartTime = new Date();
      console.log('시작 시간 : ', EnvChangerStationTransStartTime);
      await models.EnvChargeStationTran.destroy({
        where: {},
        truncate: true,
        transaction: transaction,
      });

      const [TransStationResult] = await models.sequelize.query(
        ` INSERT INTO EnvChargeStationTrans
                    (   statId,
                        statNm,
                        chgerType,
                        addr,
                        lat,
                        lng,
                        method,
                        busiId,
                        bnm,
                        parkingFree,
                        limitYn,
                        limitDetail,
                        note,
                        maxOutput)
                    SELECT
                        statId,
                        statNm,
                        chgerType,
                        addr,
                        lat,
                        lng,
                        method,
                        busiId,
                        bnm,
                        parkingFree,
                        limitYn,
                        limitDetail,
                        note,
                        MAX(output)
                    FROM EnvChargers t1
                    GROUP BY statId `,
        {
          type: Sequelize.QueryTypes.INSERT,
          transaction: transaction,
        }
      );
      console.log('EnvChanrgeStationTrans end');
      const EnvChangerStationTransEndTime = new Date();
      console.log('종료 시간 : ', EnvChangerStationTransEndTime);
      console.log(
        'EnvChargeStationTrans 걸린 시간',
        calculateDuration(EnvChangerStationTransStartTime, EnvChangerStationTransEndTime)
      );

      /**========================================================
       * Process #4 ---------create Geometry  data
       * ========================================================
       */

      console.log('lng, lat update start');
      const EnvChargersLstartTime = new Date();
      console.log('시작 시간 : ', EnvChargersLstartTime);
      const [updateResult] = await models.sequelize.query(
        'UPDATE EnvChargeStationTrans ' + "SET coordinate = ST_GEOMFROMTEXT(CONCAT('POINT(', lng, ' ', lat, ')'))",
        {
          type: Sequelize.QueryTypes.UPDATE,
          transaction: transaction,
        }
      );
      console.log('lng, lat update end');
      const EnvChargersLEndTime = new Date();
      console.log('종료 시간 : ', EnvChargersLEndTime);
      console.log('EnvChargeStationTrans Update 걸린 시간', calculateDuration(EnvChargersLstartTime, EnvChargersLEndTime));

      /**========================================================
       * Process #5 ----EnvChargeStationTrans -> EnvChargeStations
       * =========================================================
       */

      console.log('EnvChargeStationsTemp start');
      const EnvChargeStationsTempStartTime = new Date();
      console.log('시작 시간 : ', EnvChargeStationsTempStartTime);
      /*
      await models.EnvChargeStation.destroy({
        where: {},
        truncate: true,
        transaction: transaction,
      });
      */
      await models.sequelize.query('TRUNCATE TABLE EnvChargeStationsTemp;', { transaction: transaction });
      const [resultStation] = await models.sequelize.query(
        'INSERT INTO EnvChargeStationsTemp ' +
          ' (statNm,statId,chgerType,addr,coordinate,lat,lng,method,parkingFree,limitYn,limitDetail,note) ' +
          ' SELECT ' +
          ' statNm,statId,chgerType,addr,coordinate,lat,lng,method,parkingFree,limitYn,limitDetail,note  ' +
          ' FROM EnvChargeStationTrans ',
        {
          type: Sequelize.QueryTypes.INSERT,
          transaction: transaction,
        }
      );
      console.log('EnvChargeStationsTemp end');
      const EnvChargeStationsTempEndTime = new Date();
      console.log('종료 시간 : ', EnvChargeStationsTempEndTime);
      console.log(
        'EnvChargeStationsTemp insert 걸린 시간',
        calculateDuration(EnvChargeStationsTempStartTime, EnvChargeStationsTempEndTime)
      );

      const EnvChargerStationsTempRenameStartTime = new Date();
      await models.sequelize.query('ALTER TABLE EnvChargeStations RENAME EnvChargeStationsTempT;', { transaction: transaction });
      await models.sequelize.query('ALTER TABLE EnvChargeStationsTemp RENAME EnvChargeStations;', { transaction: transaction });
      await models.sequelize.query('ALTER TABLE EnvChargeStationsTempT RENAME EnvChargeStationsTemp;', { transaction: transaction });
      const EnvChargerStationsTempRenameEndTime = new Date();
      console.log('EnvChargerStationsRename 걸린 시간', calculateDuration(EnvChargerStationsTempRenameStartTime, EnvChargerStationsTempRenameEndTime));
      /**========================================================
       * Process #5 -----------------------------EvnChargeCPO 생성
       * =========================================================
       */

      // console.log('EvnChargeCPO start');
      // const EvnChargeCPOStartTime = new Date();
      // console.log('시작 시간 : ', EvnChargeCPOStartTime);
      // await models.EvnChargeCPO.destroy({
      //   where: {},
      //   // truncate: true,
      //   transaction: transaction,
      // });

      // const [resultCPO] = await models.sequelize.query(
      //   `
      //             INSERT INTO envchargecpos (busiId, bnm)
      //             SELECT DISTINCT busiId, bnm
      //                 FROM EnvChargeStations
      //             `,
      //   {
      //     type: Sequelize.QueryTypes.INSERT,
      //     transaction: transaction,
      //   }
      // );

      // 커밋
      await transaction.commit();

      // const data = await models.sequelize.query(`CALL Proc_Z_Batch_Get_EnvCharger(@p_Rtn);`);
      // const result = await models.sequelize.query(`SELECT @p_Rtn;`);
      const result = 'success';

      // 작업 마무리
      const endTime = new Date();
      const duration = endTime - startTime;
      const durationInSeconds = duration / 1000;

      const message = `전기차 충전소 데이터가 성공적으로 저장되었습니다. 작업 소요 시간: ${durationInSeconds}초`;
    } catch (error) {
      console.log('error - ', JSON.stringify(error));
      throw 'ME_API_ERROR';
    }
  } catch (e) {
    // 롤백
    await transaction.rollback();
    next(e);
  }
}

// 시간 계산
function calculateDuration(startTime, endTime) {
  const duration = endTime - startTime;
  return duration / 1000;
}

module.exports = {
  getStationDataAndModify,
};
