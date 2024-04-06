'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Sequelize } = require('sequelize');
const { Op } = sequelize;

module.exports = {
  path: ['/settlement'],
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

  const startDate = _request.query.startDate || null;
  const endDate = _request.query.endDate || null;

  try {

    let where = '';
    if (startDate){
      where = " where DATE_FORMAT(data_day, '%Y%m%d') > '"+startDate+"'";
    }

    if (endDate){
      if (!where){
        where = " where DATE_FORMAT(data_day, '%Y%m%d') < '"+endDate+"'";
      }
      else{
        where += " AND DATE_FORMAT(data_day, '%Y%m%d') < '"+endDate+"'";
      }
    }

    let queryString =
      `select A.*, B.transaction_count, B.cancel_count, C.totalCountERP
    from
    (
      select  
      DATE_FORMAT(data_day, '%Y%m%d') AS data_day, 
      SUM(sales_amount) AS sales_amount, 
      SUM(dayignore_amount) AS dayignore_amount, 
      SUM(commission_amount) AS commission_amount, 
      SUM(cancel_amount) AS cancel_amount,
      SUM(daycharge_amount) AS daycharge_amount
      from charger_records_tb 
      ${where}
      group by DATE_FORMAT(data_day, '%Y%m%d')
    ) AS A
    left join 
    (
      select DATE_FORMAT(sales_date, '%Y%m%d') AS data_day, SUM(transaction_count) as transaction_count, SUM(cancel_count) as cancel_count
      from kicc_total_records
      group by DATE_FORMAT(sales_date, '%Y%m%d')
    ) as B
    on A.data_day = B.data_day
    left join
    (
      select DATE_FORMAT(data_day, '%Y%m%d') AS data_day, COUNT(data_day) as totalCountERP
      from erp_requests_tb
      where req_type = "C"
      group by DATE_FORMAT(data_day, '%Y%m%d')
    ) as C
    on A.data_day = C.data_day
    `;

    const settlementData = await models.sequelize.query(
      queryString,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const totalCount = settlementData.length;

    var payments = [];

    for(let data of settlementData){
      const sales_date = data.data_day;
      const totalSalesAmountChargerRecordTb = data.sales_amount || 0;
      const totalCancelAmountChargerRecordTb = data.cancel_amount || 0;
      const totalCommissionAmountChargerRecordTb = data.commission_amount || 0;
      const sum_sales_amount_cancel_amount_commission_amount = parseInt(totalSalesAmountChargerRecordTb) + parseInt(totalCancelAmountChargerRecordTb) - parseInt(totalCommissionAmountChargerRecordTb);
      const ignore_kwh = formatKwh(data.dayignore_amount) || 0;
      const total_kwh = formatKwh(data.daycharge_amount) || 0;
      const transaction_count = data.transaction_count || 0;
      const cancel_count = data.cancel_count || 0;
      const totalCountPG = parseInt(transaction_count) + parseInt(cancel_count);
      const totalCountERP = data.totalCountERP || 0;
      const total_kwh_minus_ignore_kwh = total_kwh - ignore_kwh;

      payments.push({
        sales_date: sales_date,
        salesDate: parseSalesDate(sales_date),
        totalSalesAmountChargerRecordTb: totalSalesAmountChargerRecordTb,
        totalCancelAmountChargerRecordTb: totalCancelAmountChargerRecordTb,
        totalCommissionAmountChargerRecordTb: totalCommissionAmountChargerRecordTb,
        sum_sales_amount_cancel_amount_commission_amount: sum_sales_amount_cancel_amount_commission_amount,
        ignore_kwh: ignore_kwh,
        total_kwh_minus_ignore_kwh: total_kwh_minus_ignore_kwh,
        total_kwh: total_kwh,
        transaction_count: transaction_count,
        cancel_count: cancel_count,
        totalCountPG: totalCountPG,
        totalCountERP: totalCountERP,
      });
    }

    payments.sort((a, b) => (a.sales_date < b.sales_date) ? 1 : ((b.sales_date < a.sales_date) ? -1 : 0));

    _response.json({
      totalCount: totalCount,
      result: payments,
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
    return '';
  }
  return parseFloat(num / 1000).toFixed(2);
}
