"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors = require('cors'); // CORS 필터 미들웨어
const useragent = require('express-useragent');
const process_1 = __importDefault(require("process"));
const models = require('./models/index.js');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const schemas = require('./schemas');
const config_1 = require("./config/config");
const moment_1 = __importDefault(require("moment"));
require("./config/express-custom-types");
const easypay_1 = require("./util/easypay");
const { bootstrapData } = require('./bootstrapData');
const schedule = __importStar(require("node-schedule"));
const axios = require('axios');
const { processRefund } = require('./services/batchService/auto-refund-batch.js');
const { processUnitPriceReservation } = require('./services/batchService/unitprice-reservation.js');
const { getStationDataAndModifyNew } = require('./api/task/getStationDataAndModifyNew.js');
const { createStationLocationCluster } = require('./api/charging-station-cluster/createStationLocationCluster');
// express의 response에서 에러를 쉽게 응답하기 위한 확장 미들웨어 설정
const error_extender_1 = __importDefault(require("./util/error.extender"));
const writeLogToJsonFile_1 = require("./services/logService/writeLogToJsonFile");
const exception_middleware_1 = require("./middleware/exception.middleware");
const notFoundRoutes_exception_1 = require("./exceptions/notFoundRoutes.exception");
// api 디렉토리에 .js 파일만 추가해도 API가 자동으로 추가되도록 하는 API 등록 미들웨어 설정
const apiRouterRegister = require('./middleware/router-register')('./api', '.js');
const router = require('./routes');
const winston = require('winston');
const winstonMysql = require('winston-mysql');
require('dotenv').config();
const options_default = {
    host: process_1.default.env.SQL_HOST || 'localhost',
    user: process_1.default.env.SQL_USER || 'hdo-dev',
    password: process_1.default.env.SQL_PASSWORD || 'k1:04T8>K7hJ',
    database: process_1.default.env.SQL_DATABASE || 'evcore22',
    table: 'sys_logs_defaults',
};
const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [new winstonMysql(options_default)],
});
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const config = (0, config_1.configuration)();
        app.use(cors());
        app.use(useragent.express());
        app.use(bodyParser.json());
        app.use(easypay_1.fixEucKr);
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(error_extender_1.default);
        // handle uncaughtException code
        process_1.default.on('uncaughtException', (err) => {
            console.error('uncaughtException', err);
            logger.error((err === null || err === void 0 ? void 0 : err.stack) || err.toString());
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
        const mobileSwaggerSpec = swaggerJSDoc(Object.assign(Object.assign({}, options), { apis: ['./routes/mobile/*.js'] }));
        app.use('/doc', swaggerUi.serve, (req, res) => {
            let html = swaggerUi.generateHTML(mobileSwaggerSpec);
            res.send(html);
        });
        app.use('/web', swaggerUi.serve, (req, res) => {
            let html = swaggerUi.generateHTML(webSwaggerSpec);
            res.send(html);
        });
        app.get('/', (req, res) => {
            res.json({
                service_name: process_1.default.env.NODE_ENV == 'dev' ? `hdoev-api-total-dev` : `hdoev-api-total`,
                env: process_1.default.env.NODE_ENV == 'dev' ? 'dev' : 'prod',
            });
        });
        app.use(apiRouterRegister);
        router.all('*', (req, res, next) => {
            throw new notFoundRoutes_exception_1.NotFoundRoutesException();
        });
        app.use(router);
        app.use(exception_middleware_1.exceptionMiddleware);
        // Start the server
        const port = config.port;
        app.listen(port, () => {
            console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` +
                `앱이 열려있는 포트는 다음과 같습니다. : ${port}`);
            console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + `http://localhost:${port}`);
            console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + '종료하시려면 Ctrl+C 를 눌러 주십시오.');
        });
        // 스케줄러 설정
        if (process_1.default.env.NODE_ENV === 'prod') {
            const refundScheduler = schedule.scheduleJob('* * * * *', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // 스케줄러가 실행될 때마다 환불 처리 함수 호출
                    const resultCnt = yield processRefund();
                    console.log(`미충전 결제건 자동취소 스케줄러가 실행되었습니다. ${resultCnt}건 자동취소 완료`);
                });
            });
            schedule.scheduleJob('22,52 * * * *', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log('스케줄러가 API를 호출합니다.');
                    yield sleep(Math.random() * 19900 + 100);
                    const batchRecord = yield models.BatchRecord.findByPk(1);
                    // 25min trick
                    const currentTime = new Date();
                    const twentyFiveMinutesAgo = new Date(currentTime.getTime() - 25 * 60 * 1000);
                    if (new Date(batchRecord.env_chargers_stations_exec_at) < twentyFiveMinutesAgo) {
                        batchRecord.env_chargers_stations_exec_at = currentTime;
                        batchRecord.env_chargers_stations_exec_cnt += 1;
                        // 모델 업데이트
                        yield batchRecord.save();
                        // 추가 작업 실행
                        yield getStationDataAndModifyNew();
                    }
                    else {
                        console.log('station data batch is already executed in other pods.');
                    }
                });
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
            const writeRecordToJsonFile = schedule.scheduleJob('1 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
                const previousDay = (0, moment_1.default)().subtract(1, 'days').format('YYYY-MM-DD');
                yield (0, writeLogToJsonFile_1.dailyLog)(previousDay);
            }));
            const uploadLogFileToS3 = schedule.scheduleJob('5 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
                const previousDay = (0, moment_1.default)().subtract(1, 'days').format('YYYY-MM-DD');
                yield (0, writeLogToJsonFile_1.uploadLogFile)(previousDay);
            }));
            // reservation batch
            const reservationBatch = schedule.scheduleJob('0,5,10,15,20,25,30,35,40,45,50,55 * * * *', () => __awaiter(this, void 0, void 0, function* () {
                const resultUnitPriceReservation = yield processUnitPriceReservation();
                console.log('resultUnitPriceReservation::::', resultUnitPriceReservation);
            }));
        }
    });
}
bootstrap();
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
