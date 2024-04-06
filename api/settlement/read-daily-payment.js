const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
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
      const where = {
        [Op.and]: [],
      }; 

      if (startDate || endDate) {
        if (startDate && endDate) {
          where[Op.and].push({ data_day: { [Op.between]: [startDate, endDate] } });
        }
    
        if (startDate) {
          where[Op.and].push({ data_day: { [Op.gte]: startDate } });
        }
    
        if (endDate) {
          where[Op.and].push({ data_day: { [Op.lte]: endDate } });
        }
      }
   
    const { count: totalCount, rows: result } = await models.bank_total_record.findAndCountAll({
      attributes: {
        include: [
           [models.sequelize.literal(`
            (
              SELECT COUNT(*)
              FROM data_results_tb
              WHERE DATE_FORMAT(data_results_tb.data_day, '%Y%m%d') = DATE_FORMAT(bank_total_record.data_day, '%Y%m%d') AND data_results_tb.data_gubun = 'BAMK' AND data_results_tb.data_results = 'S' 
            )
            `), 'count_data_results_tb_S'],
            [models.sequelize.literal(`
            (
              SELECT COUNT(*)
              FROM data_results_tb
              WHERE DATE_FORMAT(data_results_tb.data_day, '%Y%m%d') = DATE_FORMAT(bank_total_record.data_day, '%Y%m%d') AND data_results_tb.data_gubun = 'BAMK' AND data_results_tb.data_results = 'E' 
            )
            `), 'count_data_results_tb_E'],
            [models.sequelize.literal(`
            (
              SELECT COUNT(*)
              FROM erp_results_tb
              WHERE DATE_FORMAT(erp_results_tb.data_day, '%Y%m%d') = DATE_FORMAT(bank_total_record.data_day, '%Y%m%d') AND erp_results_tb.erp_send_result = 'S'  
            )
            `), 'count_erp_results_tb_S'],
            [models.sequelize.literal(`
            (
              SELECT COUNT(*)
              FROM erp_results_tb
              WHERE DATE_FORMAT(erp_results_tb.data_day, '%Y%m%d') = DATE_FORMAT(bank_total_record.data_day, '%Y%m%d') AND erp_results_tb.erp_send_result = 'E'
            )
            `), 'count_erp_results_tb_E'],
        ],
      },
      where, 
      offset: (pageNum - 1) * rowPerPage,
      order: [['data_day', orderByQueryParam]],
      limit: rowPerPage,
    }); 
 
    _response.json({
      totalCount,
      result,
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
