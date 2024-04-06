'use strict';
const { Op } = require('sequelize');
const { HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const moment = require('moment');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment/history/user/month'],
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

  const startDate = moment().startOf('month').format('YYYY-MM-DD');
  const endDate = moment().endOf('month').format('YYYY-MM-DD');

  try {
    const where = { [Op.and]: [{ usersNewId: id }] };
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

    const calcTotal = await models.sb_charging_log.findOne({
      where,
      attributes: [
        [models.sequelize.fn('SUM', models.sequelize.literal('chargeFee')), 'totalPrice'],
        [models.sequelize.fn('SUM', models.sequelize.literal('cl_kwh * 0.001')), 'totalKwh'],
      ],
    });

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalPrice: calcTotal.dataValues?.totalPrice ? calcTotal.dataValues.totalPrice : 0,
      totalKwh: calcTotal.dataValues?.totalKwh ? calcTotal.dataValues.totalKwh : 0,
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
