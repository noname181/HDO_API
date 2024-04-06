const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const moment = require('moment/moment');
const { Sequelize } = require('sequelize');
const { Op } = sequelize;

module.exports = {
  path: ['/monthly-payment-detail'],
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
  const month = _request.query.month;
 

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
      `select A.*, B.sumTRAMT, C.chgs_station_id as chgs_station_id, C.chgs_name
      from
      (
        select  
        erp_id, 
        station_id,
        station_name,
        DATE_FORMAT(data_day, '%Y%m') AS mon, 
        SUM(sales_amount) AS sales_amount, 
        SUM(dayignore_amount) AS dayignore_amount, 
        SUM(commission_amount) AS commission_amount, 
        SUM(cancel_amount) AS cancel_amount,
        (SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = charger_records_tb.branch_id LIMIT 1) as branchName,
        (SELECT descInfo FROM CodeLookUps WHERE divCode = 'AREA' AND descVal = charger_records_tb.area_id LIMIT 1) as areaName
        from charger_records_tb
        where DATE_FORMAT(data_day, '%Y%m') = '${month}'
        group by erp_id, DATE_FORMAT(data_day, '%Y%m')
      ) as A
      left join 
      (
        select DATE_FORMAT(SDODT, '%Y%m') AS mon ,CAST(KUNNR AS UNSIGNED) AS erp_id , SUM(TRAMT) as sumTRAMT
        from bank_transaction_records
        group by KUNNR, DATE_FORMAT(SDODT, '%Y%m')
      ) as B
      on CAST(A.erp_id AS UNSIGNED) = B.erp_id and A.mon = B.mon
      inner join sb_charging_stations C
      on A.station_id = C.chgs_id
      `;

    if (where){
      queryString += ` where ${where} `;
    }
    const monthlypaymentData = await models.sequelize.query(
      queryString,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const totalCount = monthlypaymentData.length;

    const result2 = [];

    let sum_dayignore_amount = 0;
    let sum_total_payment = 0;
    let sumTRAMT = 0;

    for (let data of monthlypaymentData) {
      data.dayignore_amount = formatKwh(data.dayignore_amount);
      const data_day = parseMonth(data.mon);
      const TRAMT = data.sumTRAMT || 0;
      const sales_amount = data.sales_amount || 0;
      const cancel_amount = data.cancel_amount || 0;
      const commission_amount = data.commission_amount || 0;
      const total_payment = parseInt(sales_amount) + parseInt(cancel_amount) - parseInt(commission_amount);
      delete data.sumTRAMT;
      delete data.mon;
      const item = {
        data_day,
        TRAMT,
        total_payment, 
        total_payment_minus_TRAMT: parseInt(total_payment) - parseInt(TRAMT),
        ...data,
      };
      result2.push(item);

      sum_dayignore_amount += Number(data.dayignore_amount);
      sum_total_payment += total_payment;
      sumTRAMT += parseInt(TRAMT);
    }

    _response.json({
      totalCount,
      sum_dayignore_amount: sum_dayignore_amount,
      sum_total_payment: sum_total_payment,
      sumTRAMT: sumTRAMT,
      sum_total_payment_minus_sumTRAMT: sum_total_payment - sumTRAMT,
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
function parseMonth(sale_date) {
  const year = sale_date.slice(0, 4);
  const month = sale_date.slice(4, 6);
  const day = sale_date.slice(6, 8);

  return `${year}-${month}`;
}
function formatKwh(num){
  if(!num){
    return 0;
  }
  return parseFloat(num/1000).toFixed(2);
}
