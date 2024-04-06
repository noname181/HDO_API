'use strict';
const { Op } = require('sequelize');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment/history/user'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { id } = _request.user;

  const pageNum = _request.query.page ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 20;
  const odby = _request.query.odby ? _request.query.odby.toUpperCase() : 'DESC';
  const startDate = _request.query.startDate ? _request.query.startDate.substring(0, 10) + ' 00:00:00' : '';
  const endDate = _request.query.endDate ? _request.query.endDate.substring(0, 10) + ' 23:59:59' : '';

  try {
    const where = { [Op.and]: [{ usersNewId: id }] };
    if (startDate && endDate) {
      where[Op.and].push({
        [Op.and]: [
          {
            createdAt: { [Op.gte]: `${startDate}` },
          },
          {
            createdAt: { [Op.lte]: `${endDate}` },
          },
        ],
      });
    } else if (startDate) {
      where[Op.and].push({
        createdAt: { [Op.gte]: `${startDate}` },
      });
    } else if (endDate) {
      where[Op.and].push({
        createdAt: { [Op.lte]: `${endDate}` },
      });
    }
    let paymentIncludeDb = [
      {
        model: models.UsersNew,
        foreignKey: 'usersNewId',
        paranoid: false,
        attributes: { exclude: ['deletedAt'] },
        as: 'userNew',
      },
      {
        model: models.sb_charger,
        foreignKey: 'chg_id',
        paranoid: false,
        attributes: { exclude: ['deletedAt'] },
        as: 'chargerUseLog',
        include: [
          {
            model: models.ChargerModel,
            paranoid: false,
            foreignKey: 'chargerModelId',
            attributes: { exclude: ['deletedAt'] },
            as: 'chargerModel',
          },
        ],
      },
      {
        model: models.sb_charging_station,
        foreignKey: 'chgs_id',
        attributes: { exclude: ['deletedAt'] },
        as: 'chargingStationUseLog',
        paranoid: false,
        include: [
          {
            model: models.Org,
            foreignKey: 'orgId',
            paranoid: false,
            attributes: { exclude: ['deletedAt'] },
            as: 'org',
          },
        ],
      },
    ];

    const payments = await models.sb_charging_log.findAll({
      where,
      include: paymentIncludeDb,
      order: [['createdAt', odby]],
      offset: (pageNum - 1) * rowPerPage,
      // limit: rowPerPage,
    });

    const calcPaymentList = payments.map((payment) => ({
      ...payment.dataValues,
      price: payment.dataValues.chargeFee,
    }));

    const calcTotal = await models.sb_charging_log.findOne({
      where,
      attributes: [
        [models.sequelize.fn('SUM', models.sequelize.literal('chargeFee')), 'totalPrice'],
        [models.sequelize.fn('SUM', models.sequelize.literal('cl_kwh * 0.001')), 'totalKwh'],
      ],
    });

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount: payments.length || 0,
      totalPrice: calcTotal.dataValues?.totalPrice ? calcTotal.dataValues.totalPrice : '0',
      totalKwh: calcTotal.dataValues?.totalKwh ? calcTotal.dataValues.totalKwh.toFixed(2) : '0',
      payments: calcPaymentList,
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
