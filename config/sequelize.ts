/* sequelise config */
/* npx sequelize-cli db:migrate 용도로 인해 파일명 수정 없이 config여야 함 */
const dotenv = require('dotenv');
if (process.env.NODE_ENV === 'prod') {
  console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + 'prod enviroment');
  dotenv.config({ path: '.env.prod' });
} else {
  console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + 'dev enviroment');
  dotenv.config({ path: '.env.dev' });
}

module.exports = {
  dev: {
    username: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      dateStrings: true, // ! 데이터 로드시 문자열로 가저옴
      // typeCast: true, // ! 타임존을 역으로 계산하지 않음
      typeCast: function (field: { type: string; string: () => any }, next: () => any) {
        // for reading from database
        if (field.type === 'DATETIME') {
          return field.string();
        }
        return next();
      },
    },
    timezone: '+09:00', //for writing to database
    sync: {
      force: process.env.SQL_SYNC_FORCE !== undefined ? process.env.SQL_SYNC_FORCE === 'true' : false,
      alter: process.env.SQL_SYNC_ALTER !== undefined ? process.env.SQL_SYNC_ALTER === 'true' : true,
      logging: console.log
    },
  },
  prod: {
    username: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      dateStrings: true, // ! 데이터 로드시 문자열로 가저옴
      // typeCast: true, // ! 타임존을 역으로 계산하지 않음
      typeCast: function (field: { type: string; string: () => any }, next: () => any) {
        // for reading from database
        if (field.type === 'DATETIME') {
          return field.string();
        }
        return next();
      },
    },
    timezone: '+09:00', //for writing to database,
    sync: {
      force: process.env.SQL_SYNC_FORCE !== undefined ? process.env.SQL_SYNC_FORCE === 'true' : false,
      alter: process.env.SQL_SYNC_ALTER !== undefined ? process.env.SQL_SYNC_ALTER === 'true' : false,
      logging: false,
    },
    logging: false
  },
};
