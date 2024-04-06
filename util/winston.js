const winston = require('winston')
const winstonDaily  = require('winston-daily-rotate-file');
const { combine, timestamp, printf } = winston.format;
const { configuration } = require('../config/config');
const moment = require('moment');
const fs = require('fs');
const process = require('process')

const logDir = `${process.cwd()}/logs`;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
  if(!fs.existsSync(logDir + '/error' )) {
    fs.mkdirSync(logDir + '/error');
  }
}

moment.tz.setDefault('Asia/Seoul');
const timeStamp = () => moment().format('YYYY-MM-DD HH:mm:ss');

// Define log format
const logFormat = printf(info => {
  let mt = require('moment-timezone');

  let date = mt().tz('Asia/Seoul'); // NOTE: 날짜는 한국 시간으로 하고 싶다.

  return `${date.format()} ${info.level}: ${info.message}`;
});
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};
// const dailyRotateFileTransport = new transports.DailyRotateFile({
//   filename: logDir + 'apiTotal-%DATE%.log',
//   datePattern: 'YYYY-MM-DD-HH',
//   zippedArchive: true,
//   maxFiles: '14d'
// });
/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    // info 레벨 로그를 저장할 파일 설정
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30,  // 30일치 로그 파일 저장
      zippedArchive: true,
    }),
    // error 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error',  // error.log 파일은 /logs/error 하위에 저장
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});

// Production 환경이 아닌 경우(dev 등)
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),  // 색깔 넣어서 출력
      winston.format.simple(),  // `${info.level}: ${info.message} JSON.stringify({ ...rest })` 포맷으로 출력
    )
  }));
}

export { logger };



// moment.tz.setDefault('Asia/Seoul');
// const timeStamp = () => moment().format('YYYY-MM-DD HH:mm:ss');
//
// const logFormat = printf(info => {
//
//   let mt = require('moment-timezone');
//
//   let date = mt().tz('Asia/Seoul'); // NOTE: 날짜는 한국 시간으로 하고 싶다.
//
//   return `${date.format()} ${info.level}: ${info.message}`;
//
// });


// // const dailyRotateFileTransport = new transports.DailyRotateFile({
// //   filename: logDir + 'apiTotal-%DATE%.log',
// //   datePattern: 'YYYY-MM-DD-HH',
// //   zippedArchive: true,
// //   maxFiles: '14d'
// // });


// const levels = {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// };


// const options_default = {
//   host: process.env.SQL_HOST || 'localhost',
//   user: process.env.SQL_USER || 'hdo-dev',
//   password: process.env.SQL_PASSWORD || 'k1:04T8>K7hJ',
//   database: process.env.SQL_DATABASE || 'evcore22',
//   table: 'sys_logs_defaults'
// };
//
// //custom log table fields
// const options_custom = {
//   host: process.env.SQL_HOST || 'localhost',
//   user: process.env.SQL_USER || 'hdo-dev',
//   password: process.env.SQL_PASSWORD || 'k1:04T8>K7hJ',
//   database: process.env.SQL_DATABASE || 'evcore22',
//   table: 'Loggings',
//   fields: {level: 'level', meta: 'info', message: 'message', timestamp: 'timestamp'}
// };
//
// //meta json log table fields
// // const options_json = {
// //   host: 'localhost',
// //   user: 'logger',
// //   password: 'logger*test',
// //   database: 'WinstonTest',
// //   table: 'sys_logs_json'
// // };
//
// const logger = winston.createLogger({
//   level: 'debug',
//   format: combine(
//     timestamp({
//       format: 'YYYY-MM-DD HH:mm:ss',
//     }),
//     logFormat,
//   ),
//   defaultMeta: { service: 'user-service' },
//   transports: [new winston.transports.Console({
//     format: winston.format.simple(),
//     }),
//     new winstonDaily({
//       level: 'info', // info 레벨에선
//       datePattern: 'YYYY-MM-DD', // 파일 날짜 형식
//       dirname: logDir, // 파일 경로
//       filename: `%DATE%.log`, // 파일 이름
//       maxFiles: 30, // 최근 30일치 로그 파일을 남김
//       zippedArchive: true, // 아카이브된 로그 파일을 gzip으로 압축할지 여부
//     }),
//     //* error 레벨 로그를 저장할 파일 설정 (info에 자동 포함되지만 일부러 따로 빼서 설정)
//     new winstonDaily({
//       level: 'error', // error 레벨에선
//       datePattern: 'YYYY-MM-DD',
//       dirname: logDir + '/error', // /logs/error 하위에 저장
//       filename: `%DATE%.error.log`, // 에러 로그는 2020-05-28.error.log 형식으로 저장
//       maxFiles: 30,
//       zippedArchive: true,
//     }),
//     new winstonMysql(options_default),
//   ]
// })
//
// const stream = {
//   write: message => {
//     logger.info(message)
//   }
// }
//
// module.exports = { logger, stream };
