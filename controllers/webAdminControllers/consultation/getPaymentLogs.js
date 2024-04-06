'use strict';
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');

const getPaymentLogs = {
  path: '/web/cs-charge-history',
  method: 'get',
  checkToken: false, //TESTONLY
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const pageNum = request.query.page ? parseInt(request.query.page) : 1;
  const rowPerPage = request.query.rpp ? parseInt(request.query.rpp) : 50;
  const odby = request.query.odby ? request.query.odby.toUpperCase() : 'DESC';
  const userId = request.query.userId;
  try {
    let options = {
      where: {
        userId,
      },
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

    return response.status(HTTP_STATUS_CODE.OK).json({
      totalCount,
      result: payments,
    });
  } catch (e) {
    next(e);
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getPaymentLogs };
