const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Sequelize } = require('sequelize');
const { Op } = sequelize;

module.exports = {
  path: ['/daily-payment'],
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
    `
    select A.*, B.totalCountERP
    from
    (
      select *
      from bank_total_records as A
      ${where}
    ) as A
    left join
    (
      select DATE_FORMAT(data_day, '%Y%m%d') AS data_day, COUNT(data_day) as totalCountERP
      from erp_requests_tb
      where req_type = "F"
      group by DATE_FORMAT(data_day, '%Y%m%d')
    ) as B
    on A.data_day = B.data_day
    `;

    const dailypaymentData = await models.sequelize.query(
      queryString,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    const totalCount = dailypaymentData.length;

    var payments = [];

    for(let data of dailypaymentData){
      const totalCountERP = data.totalCountERP || 0;

      payments.push({
        totalCountERP: totalCountERP,
        ...data,
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
