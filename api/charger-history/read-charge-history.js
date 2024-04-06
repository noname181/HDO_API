'use strict';
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;
module.exports = {
  path: ['/charge-history'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const odby = _request.query.odby ? _request.query.odby.toUpperCase() : 'DESC';
  try {
    let options = {
      include: [
        {
          model: models.Booking,
          foreignKey: 'bookingId',
          attributes: { exclude: ['deletedAt', 'userId', 'chgs_id', 'chg_id'] },
          as: 'booking',
          include: [
            {
              model: models.UsersNew,
              foreignKey: 'userId',
              attributes: { exclude: ['deletedAt'] },
              as: 'user',
            },
            {
              model: models.sb_charging_station,
              foreignKey: 'chgs_id',
              attributes: { exclude: ['deletedAt'] },
              as: 'chargingStation',
              paranoid: false,
              include: [
                {
                  model: models.Org,
                  foreignKey: 'orgId',
                  attributes: { exclude: ['deletedAt'] },
                  as: 'org',
                },
              ],
            },
            {
              model: models.sb_charger,
              foreignKey: 'chg_id',
              attributes: { exclude: ['deletedAt'] },
              as: 'chargers',
              paranoid: false,
              include: [
                {
                  model: models.ChargerModel,
                  foreignKey: 'chargerModelId',
                  attributes: { exclude: ['deletedAt'] },
                  as: 'chargerModel',
                },
              ],
            },
            {
              model: models.Vehicle,
              foreignKey: 'vehicleId',
              attributes: { exclude: ['deletedAt'] },
              as: 'vehicle',
            },
          ],
        },
      ],
      order: [['createdAt', odby]],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
    };

    const { count: totalCount, rows: payments } = await models.PaymentLog.findAndCountAll(options);

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount,
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
