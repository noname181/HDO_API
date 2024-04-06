const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Op } = sequelize;
const moment = require('moment');
const { Sequelize } = require('sequelize');

module.exports = {
  path: ['/monthly-payment'],
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
  const startDate = _request.query.startDate?.replace(/-/g, '') || null;
  const endDate = _request.query.endDate?.replace(/-/g, '') || null;
  const category = _request.query.division ? _request.query.division.toUpperCase() : '';
  const month = _request.query.month;


  try {

    let where = '';
    if (month){
      where = " where DATE_FORMAT(data_day, '%Y%m') = '"+parseMonth2(month)+"'";
    }

    let queryString =
      `select A.*, B.sumTRAMT
      from
      (
        select  
        DATE_FORMAT(data_day, '%Y%m') AS mon, 
        SUM(sales_amount) AS sales_amount, 
        SUM(dayignore_amount) AS dayignore_amount, 
        SUM(commission_amount) AS commission_amount, 
        SUM(cancel_amount) AS cancel_amount
        from charger_records_tb 
        ${where}
        group by DATE_FORMAT(data_day, '%Y%m')
      ) as A
      left join 
      (
        select DATE_FORMAT(SDODT, '%Y%m') AS mon, SUM(TRAMT) as sumTRAMT
        from bank_transaction_records
        group by DATE_FORMAT(SDODT, '%Y%m')
      ) as B
      on A.mon = B.mon
      `;

    const monthlypaymentData = await models.sequelize.query(
      queryString,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const totalCount = monthlypaymentData.length;

    var payments = [];

    for(let data of monthlypaymentData){

      const key = data.mon;
      const data_day = parseMonth(data.mon);
      const TRAMT = data.sumTRAMT || 0;
      const sales_amount = data.sales_amount || 0;
      const cancel_amount = data.cancel_amount || 0;
      const commission_amount = data.commission_amount || 0;
      const total_payment = parseInt(sales_amount) + parseInt(cancel_amount) - parseInt(commission_amount);
      const sum_dayignore_amount = formatKwh(data.dayignore_amount) || 0;
      delete data.sumTRAMT;
      delete data.mon;

      payments.push({
          key: key,
          data_month: data_day,
          total_deposit_amount: TRAMT,
          total_payment: total_payment,
          total_ignore_kwh: sum_dayignore_amount,
          total_payment_minus_deposit_amount: total_payment - TRAMT,
      });
    }

    payments.sort((a, b) => (a.key < b.key) ? 1 : ((b.key < a.key) ? -1 : 0));

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

function parseMonth(sale_date) {
  const year = sale_date.slice(0, 4);
  const month = sale_date.slice(4, 6);

  return `${year}-${month}`;
}
function parseMonth2(sale_date) {
  const year = sale_date.slice(0, 4);
  const month = sale_date.slice(5, 7);

  return `${year}${month}`;
}
function formatKwh(num) {
  if (!num) {
    return '';
  }
  return parseFloat(num / 1000).toFixed(2);
}
