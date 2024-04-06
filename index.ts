import express, { Express, NextFunction, Request, Response, Router } from 'express';
const cors = require('cors'); // CORS 필터 미들웨어
const useragent = require('express-useragent');
import process from 'process';
const models = require('./models/index.js');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const schemas = require('./schemas');
import { configuration } from './config/config';
import moment from 'moment';
import './config/express-custom-types';
import { fixEucKr } from './util/easypay';
const { bootstrapData } = require('./bootstrapData');
import * as schedule from 'node-schedule';
const axios = require('axios');
const { processRefund } = require('./services/batchService/auto-refund-batch.js');
const { processUnitPriceReservation } = require('./services/batchService/unitprice-reservation.js');
const { getStationDataAndModifyNew } = require('./api/task/getStationDataAndModifyNew.js');
const { createStationLocationCluster } = require('./api/charging-station-cluster/createStationLocationCluster');

// express의 response에서 에러를 쉽게 응답하기 위한 확장 미들웨어 설정
import errorResponseExtender from './util/error.extender';
import { dailyLog, uploadLogFile } from './services/logService/writeLogToJsonFile';
import { exceptionMiddleware } from './middleware/exception.middleware';
import { NotFoundRoutesException } from './exceptions/notFoundRoutes.exception';
// api 디렉토리에 .js 파일만 추가해도 API가 자동으로 추가되도록 하는 API 등록 미들웨어 설정
const apiRouterRegister = require('./middleware/router-register')('./api', '.js');
const router = require('./routes');

const winston = require('winston');
const winstonMysql = require('winston-mysql');
require('dotenv').config();

const options_default = {
  host: process.env.SQL_HOST || 'localhost',
  user: process.env.SQL_USER || 'hdo-dev',
  password: process.env.SQL_PASSWORD || 'k1:04T8>K7hJ',
  database: process.env.SQL_DATABASE || 'evcore22',
  table: 'sys_logs_defaults',
};

const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [new winstonMysql(options_default)],
});

async function bootstrap() {
  const app: Express = express();
  const config = configuration();

  app.use(cors());
  app.use(useragent.express());
  app.use(bodyParser.json());
  app.use(fixEucKr);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(errorResponseExtender);

  // handle uncaughtException code
  process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
    logger.error(err?.stack || err.toString());
  });

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Open API',
        version: '2.0.0',
      },
      servers: [
        {
          url: '/v1',
        },
      ],
      components: {
        schemas: schemas,
        securitySchemes: {
          Authorization: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            scheme: 'basic',
            // bearerFormat: "JWT",
            description: 'Access token to access api endpoints2',
          },
          // basicAuthExternal: {
          //   type: 'http',
          //   scheme: 'basic',
          //   name : 'Authorization',
          //   in : 'header'
          // },
          // basicAuthHdo: {
          //   type: 'apiKey',
          //   scheme: 'basic',
          //   name : 'Authorization',
          //   in : 'header'
          // },
        },
      },
    },
    apis: ['./routes/web/*.js'],
  };
  const webSwaggerSpec = swaggerJSDoc(options);
  const mobileSwaggerSpec = swaggerJSDoc({
    ...options,
    apis: ['./routes/mobile/*.js'],
  });
  app.use('/doc', swaggerUi.serve, (req, res) => {
    let html = swaggerUi.generateHTML(mobileSwaggerSpec);
    res.send(html);
  });
  app.use('/web', swaggerUi.serve, (req, res) => {
    let html = swaggerUi.generateHTML(webSwaggerSpec);
    res.send(html);
  });

  app.get('/', (req: Request, res: Response) => {
    res.json({
      service_name: process.env.NODE_ENV == 'dev' ? `hdoev-api-total-dev` : `hdoev-api-total`,
      env: process.env.NODE_ENV == 'dev' ? 'dev' : 'prod',
    });
  });
  app.use(apiRouterRegister);

  router.all('*', (req: Request, res: Response, next: NextFunction) => {
    throw new NotFoundRoutesException();
  });
  app.use(router);

  app.use(exceptionMiddleware);

  // Start the server
  const port = config.port;
  app.listen(port, () => {
    console.log(
      `[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` +
        `앱이 열려있는 포트는 다음과 같습니다. : ${port}`
    );
    console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + `http://localhost:${port}`);
    console.log(
      `[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + '종료하시려면 Ctrl+C 를 눌러 주십시오.'
    );
  });
  // 스케줄러 설정
  if (process.env.NODE_ENV === 'prod') {
    const refundScheduler = schedule.scheduleJob('* * * * *', async function () {
      // 스케줄러가 실행될 때마다 환불 처리 함수 호출
      const resultCnt = await processRefund();

      console.log(`미충전 결제건 자동취소 스케줄러가 실행되었습니다. ${resultCnt}건 자동취소 완료`);
    });

    schedule.scheduleJob('22,52 * * * *', async function () {
      console.log('스케줄러가 API를 호출합니다.');
      await sleep(Math.random() * 19900 + 100);
      const batchRecord = await models.BatchRecord.findByPk(1);

      // 25min trick
      const currentTime = new Date();
      const twentyFiveMinutesAgo = new Date(currentTime.getTime() - 25 * 60 * 1000);

      if (new Date(batchRecord.env_chargers_stations_exec_at) < twentyFiveMinutesAgo) {
        batchRecord.env_chargers_stations_exec_at = currentTime;
        batchRecord.env_chargers_stations_exec_cnt += 1;

        // 모델 업데이트
        await batchRecord.save();

        // 추가 작업 실행
        await getStationDataAndModifyNew();
      } else {
        console.log('station data batch is already executed in other pods.');
      }
    });

    // schedule.scheduleJob('0 4 1 * *', async function () {
    //   console.log('클러스터링 프로세스 시작');
    //   // 클러스터링 시작
    //   await createStationLocationCluster()
    //     .then(() => {
    //       console.log('클러스터링 프로세스 완료');
    //     })
    //     .catch((error: any) => {
    //       console.error('오류 발생:', error);
    //     });
    // });
    // async function fnCallEvstationProc() {
    //   const result = await models.sequelize.query(`CALL Proc_Insert_AND_Update_Data_From_Sap_Evstation()`);
    //   console.log('sapEvstationBatch Executed : ', result);
    // }
    // async function fnCallOilStationProc() {
    //   const result = await models.sequelize.query(`CALL Proc_Insert_AND_Update_Data_From_Sap_Oil_Station()`);
    //   console.log('sapOilStationBatch Executed : ', result);
    // }
    // async function fnCallUpdateSapUsersProc() {
    //   const result = await models.sequelize.query(`CALL Proc_Insert_AND_Update_Users_News_From_Sap_People`);
    //   console.log('sapUsersBatch Executed : ', result);
    // }
    // // call procedure batch every hour 5, 35min
    // const sapEvstationBatch = schedule.scheduleJob('5,35 * * * *', async () => {
    //   await fnCallEvstationProc();
    // });
    //
    // // call procedure batch every hour 5, 35min
    // const sapOilStationBatch = schedule.scheduleJob('5,35 * * * *', async () => {
    //   await fnCallOilStationProc();
    // });
    //
    // // call procedure batch every hour 5, 35min
    // const sapUsersBatch = schedule.scheduleJob('5,35 * * * *', async () => {
    //   await fnCallUpdateSapUsersProc();
    // });

    const writeRecordToJsonFile = schedule.scheduleJob('1 0 * * *', async () => {
      const previousDay = moment().subtract(1, 'days').format('YYYY-MM-DD');
      await dailyLog(previousDay);
    });
    const uploadLogFileToS3 = schedule.scheduleJob('5 0 * * *', async () => {
      const previousDay = moment().subtract(1, 'days').format('YYYY-MM-DD');
      await uploadLogFile(previousDay);
    });

    // reservation batch
    const reservationBatch = schedule.scheduleJob('0,5,10,15,20,25,30,35,40,45,50,55 * * * *', async () => {
      const resultUnitPriceReservation = await processUnitPriceReservation();
      console.log('resultUnitPriceReservation::::', resultUnitPriceReservation);
    });
  }
}
bootstrap();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
