'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
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

  const where = {
    [Op.and]: [],
  };

  if (startDate || endDate) {
    if (startDate && endDate) {
      where[Op.and].push({ sales_date: { [Op.between]: [startDate, endDate] } });
    }

    if (startDate) {
      where[Op.and].push({ sales_date: { [Op.gte]: startDate } });
    }

    if (endDate) {
      where[Op.and].push({ sales_date: { [Op.lte]: endDate } });
    }
  }

  try {
    const { count: totalCount, rows: kiccTotalRecords } = await models.kicc_total_record.findAndCountAll({
      where,
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
      order: [['sales_date', orderByQueryParam]],
      attributes: [
        'id',
        'sales_date',
        'record_type',
        'total_records',
        'total_page',
        'current_page',
        'transaction_count',
        'transaction_amount',
        'cancel_count',
        'cancel_amount',
        'total_count',
        'total_amount',
        'pg_commission',
        'extra_commission',
        'total_commission',
        'tax_amount',
        'adjust_amount',
        'total_kwh',
        'ignore_kwh',
        [
          models.sequelize.literal(`(
            SELECT COUNT(*) 
            FROM kicc_transaction_records 
            WHERE payment_date = DATE_FORMAT(kicc_total_record.sales_date, '%Y%m%d') 
          )`),
          'totalCountPG',
        ],
        [
          models.sequelize.literal(`(
            SELECT COUNT(*) 
            FROM erp_results_tb 
            WHERE data_day = DATE_FORMAT(kicc_total_record.sales_date, '%Y%m%d') 
          )`),
          'totalCountERP',
        ],
        [
          models.sequelize.literal(`(
            SELECT SUM(sales_amount) 
            FROM charger_records_tb
            WHERE data_day = DATE_FORMAT(kicc_total_record.sales_date, '%Y%m%d') 
          )`),
          'totalSalesAmountChargerRecordTb',
        ],
        [
          models.sequelize.literal(`(
            SELECT SUM(cancel_amount) 
            FROM charger_records_tb
            WHERE data_day = DATE_FORMAT(kicc_total_record.sales_date, '%Y%m%d') 
          )`),
          'totalCancelAmountChargerRecordTb',
        ],
        [
          models.sequelize.literal(`(
            SELECT SUM(commission_amount) 
            FROM charger_records_tb
            WHERE data_day = DATE_FORMAT(kicc_total_record.sales_date, '%Y%m%d') 
          )`),
          'totalCommissionAmountChargerRecordTb',
        ],
        [
          models.sequelize.literal(`(
            SELECT SUM(deposit_amount) 
            FROM charger_records_tb
            WHERE data_day = DATE_FORMAT(kicc_total_record.sales_date, '%Y%m%d') 
          )`),
          'totalDepositAmountChargerRecordTb',
        ],
        [
          models.sequelize.literal(`(
            SELECT SUM(COALESCE(charger_records_tb.sales_amount, 0) + COALESCE(charger_records_tb.cancel_amount, 0) - COALESCE(charger_records_tb.commission_amount, 0)) 
            FROM charger_records_tb
            WHERE data_day = DATE_FORMAT(kicc_total_record.sales_date, '%Y%m%d') 
          )`),
          'sum_sales_amount_cancel_amount_commission_amount',
        ],
        // [
        //   models.sequelize.literal(
        //     `(SELECT SUM(cl_kwh) FROM sb_charging_logs WHERE createdAt = ${models.sequelize.fn('from_unixtime', models.squelize.col('timestampField'))`
        //   ),
        //   'totalChargingLogs',
        // ],
      ],
    });

    const result = [];

    for (let kicc of kiccTotalRecords) {
      const salesDate = parseSalesDate(kicc.dataValues.sales_date.toString());
      if (kicc.dataValues.total_kwh) kicc.dataValues.total_kwh = formatKwh(kicc.dataValues.total_kwh) || 0;
      else kicc.dataValues.total_kwh = 0;

      if (kicc.dataValues.ignore_kwh) kicc.dataValues.ignore_kwh = formatKwh(kicc.dataValues.ignore_kwh) || 0;
      else kicc.dataValues.ignore_kwh = 0;

      kicc.dataValues.total_kwh_minus_ignore_kwh = kicc.dataValues.total_kwh - kicc.dataValues.ignore_kwh;

      const item = {
        ...kicc.dataValues,
        salesDate,
      };
      result.push(item);
    }

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

function formatKwh(num) {
  if (!num) {
    return '';
  }
  return parseFloat(num / 1000).toFixed(2);
}
