const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Sequelize } = require('sequelize');
const { Op } = sequelize;

module.exports = {
  path: ['/settlement-detail'],
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
  //const category = _request.query.division ? _request.query.division.toUpperCase() : '';

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
      `select A.*, 
      B.erp_send_result as erp_send_result_last, B.erp_check_result as erp_check_result_last, B.erp_send_message as erp_send_message_last, B.erp_check_message as erp_check_message_last, 
      B2.erp_send_result as erp_send_result_first, B2.erp_check_result as erp_check_result_first, B2.erp_send_message as erp_send_message_first, B2.erp_check_message as erp_check_message_first ,
      B3.countERP,
      C.chgs_station_id as chargingStation, C.chgs_name
      from
      (
        select  
        erp_id, 
        station_id,
        station_name,
        DATE_FORMAT(data_day, '%Y%m%d') AS data_day, 
        SUM(sales_amount) AS sales_amount, 
        SUM(dayignore_amount) AS dayignore_amount, 
        SUM(commission_amount) AS commission_amount, 
        SUM(cancel_amount) AS cancel_amount,
        SUM(cancel_count) AS cancel_count,
        SUM(transaction_count) AS transaction_count,
        SUM(daycharge_amount) AS daycharge_amount,
        (SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = charger_records_tb.branch_id LIMIT 1) as branchName,
        (SELECT descInfo FROM CodeLookUps WHERE divCode = 'AREA' AND descVal = charger_records_tb.area_id LIMIT 1) as areaName
        from charger_records_tb
        where DATE_FORMAT(data_day, '%Y%m%d') = '${date}'
        group by erp_id, DATE_FORMAT(data_day, '%Y%m%d')
      ) as A
      left join 
      (
        select data_day, erp_id, erp_send_result, erp_send_message, erp_check_result, erp_check_message
        from erp_requests_tb 
        where (data_day, erp_id, erp_trial, req_type) in (
          select DATE_FORMAT(data_day, '%Y%m%d') AS data_day, erp_id, max(erp_trial), req_type
          from erp_requests_tb
          where req_type = 'C' 
          group by erp_id, DATE_FORMAT(data_day, '%Y%m%d')
        )
      ) as B
      on A.erp_id = B.erp_id and A.data_day = B.data_day
      left join 
      (
        select data_day, erp_id, erp_send_result, erp_send_message, erp_check_result, erp_check_message 
        from erp_requests_tb 
        where (data_day, erp_id, erp_trial, req_type) in (
          select DATE_FORMAT(data_day, '%Y%m%d') AS data_day, erp_id, min(erp_trial), req_type
          from erp_requests_tb
          where req_type = 'C' 
          group by erp_id, DATE_FORMAT(data_day, '%Y%m%d')
        )
      ) as B2
      on A.erp_id = B2.erp_id and A.data_day = B2.data_day
      left join
      (
        select data_day, erp_id, COUNT(data_day) as countERP
        from erp_requests_tb
        where req_type = "C"
        group by erp_id, DATE_FORMAT(data_day, '%Y%m%d')
      ) as B3
      on A.erp_id = B3.erp_id and A.data_day = B3.data_day
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

    let sum_sales_amount = 0;
    let sum_cancel_count = 0;
    let sum_cancel_amount = 0;
    let sum_daycharge_amount = 0;
    let sum_dayignore_amount = 0;
    let sum_daycharge_amount_minus_dayignore_amount = 0;
    let sum_transaction_count = 0;
    let sum_commission_amount = 0;
    let sum_deposit_amount = 0;
    let sum_sales_amount_cancel_amount_commission_amount = 0;
    let totalCountERP = 0;
    let totalCountPG = 0;

    for (let data of settlementData) {
      data.daycharge_amount = formatKwh(data.daycharge_amount);
      data.dayignore_amount = formatKwh(data.dayignore_amount);
      const data_day = parseSalesDate(data.data_day.toString());
      const sales_amount = Number(data.sales_amount) || 0;
      const cancel_amount = Number(data.cancel_amount) || 0;
      const commission_amount = Number(data.commission_amount) || 0;
      const daycharge_amount = Number(data.daycharge_amount) || 0;
      const dayignore_amount = Number(data.dayignore_amount) || 0;
      const deposit_amount = parseInt(sales_amount) + parseInt(cancel_amount) - parseInt(commission_amount);
      const daycharge_amount_minus_dayignore_amount = daycharge_amount - dayignore_amount;
      const countERP = Number(data.countERP) || 0;
      const transaction_count = Number(data.transaction_count) || 0;
      const cancel_count = Number(data.cancel_count) || 0;

      const item = {
        data_day,
        deposit_amount,
        daycharge_amount_minus_dayignore_amount,
        ...data,
      };
      result2.push(item);

      sum_sales_amount += sales_amount;
      sum_cancel_count += Number(data.cancel_count);
      sum_cancel_amount += cancel_amount;
      sum_daycharge_amount += daycharge_amount;
      sum_dayignore_amount += dayignore_amount;
      sum_daycharge_amount_minus_dayignore_amount += daycharge_amount_minus_dayignore_amount;
      sum_transaction_count += Number(data.transaction_count);
      sum_commission_amount += commission_amount;
      sum_deposit_amount += deposit_amount;
      sum_sales_amount_cancel_amount_commission_amount += deposit_amount;
      totalCountERP += countERP;
      totalCountPG += transaction_count + cancel_count;
    }

    _response.json({
      totalCount,
      sum_sales_amount: sum_sales_amount,
      sum_cancel_count: sum_cancel_count,
      sum_cancel_amount: sum_cancel_amount,
      sum_daycharge_amount: sum_daycharge_amount,
      sum_dayignore_amount: sum_dayignore_amount,
      sum_daycharge_amount_minus_dayignore_amount: sum_daycharge_amount_minus_dayignore_amount,
      sum_transaction_count: sum_transaction_count,
      sum_commission_amount: sum_commission_amount,
      sum_deposit_amount: sum_deposit_amount,
      sum_sales_amount_cancel_amount_commission_amount: sum_sales_amount_cancel_amount_commission_amount,
      totalCountERP: totalCountERP,
      totalCountPG: totalCountPG,
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

function formatKwh(num) {
  if (!num) {
    return 0;
  }
  return parseFloat(num / 1000).toFixed(2);
}
