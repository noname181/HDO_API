const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
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
  const category = _request.query.division ? _request.query.division.toUpperCase() : '';

  try {
    const SEARCH_KEY = {
      CHGS_STATION_ID: 'chgs_station_id',
      CHGS_NAME: 'chgs_name',
    };

    const where = {
      [Op.and]: [],
    };

    if (date) {
      where[Op.and].push({ data_day: date });
    }
    switch (searchKey) {
      case SEARCH_KEY.CHGS_STATION_ID:
        where[Op.and].push({
          '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.CHGS_NAME:
        where[Op.and].push({
          '$chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      default:
        if (searchVal) {
          where[Op.and].push({
            [Op.or]: [
              { '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } },
            ],
          });
        }
        break;
    }

    if (_request.query.area) where[Op.and].push({ '$charger_records_tb.area_id$': _request.query.area });
    if (_request.query.branch) where[Op.and].push({ '$charger_records_tb.branch_id$': _request.query.branch });

    if (category) where[Op.and].push({ '$chargingStation.org.category$': category });

    const includeMore = [
      {
        model: models.sb_charging_station,
        attributes: { exclude: ['deletedAt'] },
        as: 'chargingStation',
        paranoid: false,
      },
    ];

    // let getQuery;
    const { count: totalCount, rows: result } = await models.charger_records_tb.findAndCountAll({
      where,
      include: includeMore,
      attributes: [
        'data_day',
        'charger_id',
        'station_id',
        'erp_id',
        'daycharge_amount',
        'dayignore_amount',
        'org_id',
        'mall_id',
        'sales_amount',
        'payment_method',
        'area_id',
        'branch_id',
        'station_name',
        'transaction_count',
        'cancel_count',
        'cancel_amount',
        'commission_amount',
        'deposit_amount', 
        [
          models.sequelize.literal(
            `(SELECT erp_send_result FROM erp_requests_tb WHERE data_day = charger_records_tb.data_day AND erp_id = charger_records_tb.erp_id AND (req_type <> 'TN' OR req_type is null) ORDER BY id DESC LIMIT 1)`
          ),
          'erp_send_result0',
        ],
        [
          models.sequelize.literal(
            `(SELECT erp_send_result FROM erp_requests_tb WHERE data_day = charger_records_tb.data_day AND erp_id = charger_records_tb.erp_id AND req_type = 'TN' ORDER BY id DESC LIMIT 1)`
          ),
          'erp_send_result',
        ],
        [
          models.sequelize.literal(
            `(SELECT result FROM settlement_resend_results WHERE data_day = charger_records_tb.data_day AND erp_id = charger_records_tb.erp_id AND payment_method = charger_records_tb.payment_method ORDER BY id DESC LIMIT 1)`
          ),
          'resend_result',
        ],
        [
          models.sequelize.literal(
            `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = charger_records_tb.branch_id LIMIT 1)`
          ),
          'branchName',
        ],
        [
          models.sequelize.literal(
            `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'AREA' AND descVal = charger_records_tb.area_id LIMIT 1)`
          ),
          'areaName',
        ],
      ],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
      // logging: (query) => {
      //   console.log('query:::::', query);
      //   getQuery = query;
      // },
    });
    const result2 = [];

    for (let data of result) {
      const data_day = parseSalesDate(data.dataValues.data_day.toString());
      if (data.dataValues.daycharge_amount)
        data.dataValues.daycharge_amount = formatKwh(data.dataValues.daycharge_amount) || 0;
      else data.dataValues.daycharge_amount = 0;

      if (data.dataValues.dayignore_amount)
        data.dataValues.dayignore_amount = formatKwh(data.dataValues.dayignore_amount) || 0;
      else data.dataValues.dayignore_amount = 0;

      data.dataValues.daycharge_amount_minus_dayignore_amount =
        data.dataValues.daycharge_amount - data.dataValues.dayignore_amount;

      data.dataValues.daycharge_amount_minus_dayignore_amount =
        data.dataValues.daycharge_amount - data.dataValues.dayignore_amount;

      data.dataValues.sales_amount = data.dataValues.sales_amount || 0;

      data.dataValues.cancel_amount = data.dataValues.cancel_amount || 0;

      data.dataValues.deposit_amount = data.dataValues.deposit_amount || 0;

      data.dataValues.sum_sales_amount_cancel_amount_commission_amount =
        data.dataValues.sales_amount + data.dataValues.cancel_amount - data.dataValues.commission_amount;

      const item = {
        ...data.dataValues,
        data_day,
      };
      result2.push(item);
    }

    const sum = await models.charger_records_tb.findOne({
      attributes: [
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(charger_records_tb.sales_amount, 0)')),
          'sum_sales_amount',
        ],
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(charger_records_tb.cancel_count, 0)')),
          'sum_cancel_count',
        ],
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(charger_records_tb.cancel_amount, 0)')),
          'sum_cancel_amount',
        ],
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(charger_records_tb.daycharge_amount, 0)')),
          'sum_daycharge_amount',
        ],
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(charger_records_tb.dayignore_amount, 0)')),
          'sum_dayignore_amount',
        ],
        [
          models.sequelize.fn(
            'SUM',
            models.sequelize.literal(
              'COALESCE(charger_records_tb.daycharge_amount, 0) - COALESCE(charger_records_tb.dayignore_amount, 0)'
            )
          ),
          'sum_daycharge_amount_minus_dayignore_amount',
        ],
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(charger_records_tb.transaction_count, 0)')),
          'sum_transaction_count',
        ],
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(charger_records_tb.commission_amount, 0)')),
          'sum_commission_amount',
        ],
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(charger_records_tb.deposit_amount, 0)')),
          'sum_deposit_amount',
        ],
        [
          models.sequelize.fn(
            'SUM',
            models.sequelize.literal(
              'COALESCE(charger_records_tb.sales_amount, 0) + COALESCE(charger_records_tb.cancel_amount, 0) - COALESCE(charger_records_tb.commission_amount, 0)'
            )
          ),
          'sum_sales_amount_cancel_amount_commission_amount',
        ],
        // [
        //   models.sequelize.fn('ROUND', models.sequelize.fn('SUM', models.sequelize.literal('(COALESCE(chargingLogs.cl_kwh, 0)/1000) + (COALESCE(chargingLogs.ignored_kwh, 0)/1000)')), 2),
        //   'sumIgnoredKwh'
        // ],
      ],
      where,
      include: includeMore,
    });

    _response.json({
      totalCount,
      sum_sales_amount: sum?.dataValues?.sum_sales_amount || 0,
      sum_cancel_count: sum?.dataValues?.sum_cancel_count || 0,
      sum_cancel_amount: sum?.dataValues?.sum_cancel_amount || 0,
      sum_daycharge_amount: formatKwh(sum?.dataValues?.sum_daycharge_amount) || 0,
      sum_dayignore_amount: formatKwh(sum?.dataValues?.sum_dayignore_amount) || 0,
      sum_daycharge_amount_minus_dayignore_amount:
        formatKwh(sum?.dataValues?.sum_daycharge_amount_minus_dayignore_amount) || 0,
      sum_transaction_count: sum?.dataValues?.sum_transaction_count || 0,
      sum_commission_amount: sum?.dataValues?.sum_commission_amount || 0,
      sum_deposit_amount: sum?.dataValues?.sum_deposit_amount || 0,
      sum_sales_amount_cancel_amount_commission_amount:
        sum?.dataValues?.sum_sales_amount_cancel_amount_commission_amount || 0,
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
    return '';
  }
  return parseFloat(num / 1000).toFixed(2);
}
