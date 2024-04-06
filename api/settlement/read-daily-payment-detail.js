const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Sequelize } = require('sequelize');
const { Op } = sequelize;

module.exports = {
  path: ['/daily-payment-detail'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page && _request.query.page > 0 ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
  const searchKey = _request.query.searchKey ? _request.query.searchKey.trim() : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal.trim() : '';
  const date = _request.query.date || null;
  const category = _request.query.division ? _request.query.division.toUpperCase() : '';

  try {
    let where = '';

    switch (searchKey) {
      case 'chgs_station_id':
        where += ' C.chgs_station_id like "%' + searchVal + '%" ';
        break;
      case 'chgs_name':
        where += ' A.station_name like "%' + searchVal + '%" ';
        break;
      default:
        if (searchVal) {
          where += ' C.chgs_station_id like "%' + searchVal + '%" OR A.station_name like "%' + searchVal + '%" ';
        }
        break;
    }

    if (_request.query.area) {
      if(where){
        where += ' AND ';
      }
      where += ' A.areaName = "' + _request.query.area + '" ';
    }

    if (_request.query.branch) {
      if(where){
        where += ' AND ';
      }
      where += ' A.branchName = "' + _request.query.branch + '" ';
    }

    let queryString =
      `select A.*, B.erp_send_result, C.chgs_station_id as chargingStation, C.chgs_name
      from
      (
        select  
        DATE_FORMAT(SDODT, '%Y%m%d') AS data_day,
        CAST(KUNNR AS UNSIGNED) AS erp_id, 
        station_id,
        station_name,
        1 AS TRAGB,
        SUM(TRAMT) AS TRAMT,
        (SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = bank_transaction_records.branch_id LIMIT 1) as branchName,
        (SELECT descInfo FROM CodeLookUps WHERE divCode = 'AREA' AND descVal = bank_transaction_records.area_id LIMIT 1) as areaName
        from bank_transaction_records
        where DATE_FORMAT(SDODT, '%Y%m%d') = '${date}'
        group by KUNNR, DATE_FORMAT(SDODT, '%Y%m%d')
      ) as A
      left join 
      (
        select DATE_FORMAT(data_day, '%Y%m%d') AS data_day, erp_id, erp_send_result
        from erp_requests_tb
        where req_type = 'F'
        group by erp_id, DATE_FORMAT(data_day, '%Y%m%d')
      ) as B
      on A.erp_id = B.erp_id and A.data_day = B.data_day
      left join sb_charging_stations C
      on A.station_id = C.chgs_id
      `;

    if (where){
      queryString += ` where ${where} `;
    }
    const settlementData = await models.sequelize.query(
      queryString,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const totalCount = settlementData.length;

    const result2 = [];

    let sumTRAGB = 0;
    let sumTRAMT = 0;

    for (let data of settlementData) {
      const SDODT = parseSalesDate(data.data_day);
      const item = {
        SDODT,
        ...data,
      };
      result2.push(item);

      sumTRAGB += Number(data.TRAGB);
      sumTRAMT += Number(data.TRAMT);
    }

    _response.json({
      totalCount,
      sumTRAGB: sumTRAGB,
      sumTRAMT: sumTRAMT,
      result: result2,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}

function parseSalesDate(sale_date) {
  const year = sale_date.slice(0, 4);
  const month = sale_date.slice(4, 6);
  const day = sale_date.slice(6, 8);

  return `${year}-${month}-${day}`;
}
