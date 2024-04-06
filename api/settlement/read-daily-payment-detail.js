const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
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
    const SEARCH_KEY = {
      CHGS_STATION_ID: 'chgs_station_id',
      CHGS_NAME: 'chgs_name',
    };

    const where = {
      [Op.and]: [],
    };

    if (date) {
      where[Op.and].push({ SDODT: parseSalesDate(date.toString()) });
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

    if (_request.query.area) where[Op.and].push({ '$bank_transaction_record.area_id$': _request.query.area });
    if (_request.query.branch) where[Op.and].push({ '$bank_transaction_record.branch_id$': _request.query.branch });

    if (category) where[Op.and].push({ '$chargingStation.org.category$': category });

    const includeMore = [
      {
        model: models.sb_charging_station,
        attributes: { exclude: ['deletedAt'] },
        as: 'chargingStation',
        paranoid: false,
      },
    ];
    const { count: totalCount, rows: result } = await models.bank_transaction_record.findAndCountAll({
      where,
      include: includeMore,
      attributes: [
        'id',
        'ZIFKEY',
        'BUKRS',
        'SDODT',
        'BNKCD',
        'SNDID',
        'RCVID',
        'FBBTY',
        'LCONO',
        'SNDDT',
        'BAKNO',
        'TRAGB',
        'TBKCD',
        'TRAMT',
        'BALSG',
        'BAAMT',
        'RAMPT',
        'TRANM',
        'BILNO',
        'OPTI1',
        'OPTI2',
        'OPTI3',
        'CMSCD',
        'JUMIN',
        'VBKNO',
        'KUNNR',
        'TRATM',
        'TRADT',
        'HBKID',
        'HKTID',
        'HKONT',
        'SAKNR',
        'IOGUB',
        'POSGB',
        'POSST',
        'GJAHR',
        'BELNR',
        'REVBN',
        'ERRTX',
        'VERR1',
        'VERR2',
        'BENR2',
        'RVBN2',
        'VBLNR',
        'LIFNR',
        'RZAWE',
        'BINO2',
        'BKONT',
        'EIGR1',
        'IKBNO',
        'IKBSQ',
        'CTRDT',
        'ODONO',
        'SEQNO',
        'BNKGB',
        'area_id',
        'branch_id',
        'station_name',
        'station_id',
        [
          models.sequelize.literal(
            `(SELECT erp_send_result FROM erp_requests_tb WHERE data_day = ${date} ORDER BY id DESC LIMIT 1)`
          ),
          'erp_send_result',
        ],
        [
          models.sequelize.literal(
            `(SELECT result FROM daily_resend_results WHERE data_day = ${date} AND transaction_id = bank_transaction_record.id ORDER BY id DESC LIMIT 1)`
          ),
          'resend_result',
        ],
        [
          models.sequelize.literal(
            `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = bank_transaction_record.branch_id LIMIT 1)`
          ),
          'branchName',
        ],
        [
          models.sequelize.literal(
            `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'AREA' AND descVal = bank_transaction_record.area_id LIMIT 1)`
          ),
          'areaName',
        ],
      ],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
    });

    const result2 = [];

    for (let data of result) {
      const item = {
        ...data.dataValues,
      };
      item.TRAGB = '1'; //이체건수는 로우당 1고정
      result2.push(item);
    }

    const sum = await models.bank_transaction_record.findOne({
      attributes: [
        [
          models.sequelize.fn('COUNT', models.sequelize.literal('COALESCE(bank_transaction_record.TRAGB, 0)')),
          'sumTRAGB',
        ],
        [
          models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(bank_transaction_record.TRAMT, 0)')),
          'sumTRAMT',
        ],
      ],
      where,
      include: includeMore,
    });

    _response.json({
      totalCount,
      sumTRAGB: sum?.dataValues?.sumTRAGB || 0,
      sumTRAMT: sum?.dataValues?.sumTRAMT || 0,
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
