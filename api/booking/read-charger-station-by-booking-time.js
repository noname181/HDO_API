'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/booking-charger-station'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const b_time_in = _request.query.b_time_in || null;
    const b_time_out = _request.query.b_time_out || null;

    let where = {};
    if (b_time_in && b_time_out) {
      where = {
        [Op.or]: [
          {
            [Op.and]: [
              {
                b_time_in: {
                  [Op.lt]: b_time_in,
                },
              },
              {
                b_time_out: {
                  [Op.lt]: b_time_in,
                },
              },
            ],
          },
          {
            [Op.and]: [
              {
                b_time_in: {
                  [Op.gt]: b_time_out,
                },
              },
              {
                b_time_out: {
                  [Op.gt]: b_time_out,
                },
              },
            ],
          },
        ],
      };
    }

    //Find all charger station
    const chargerStations = await models.sb_charging_station.findAll({
      where: {
        status: 'ACTIVE',
      },
      attributes: ['chgs_id', 'chgs_station_id', 'status', 'chgs_name', 'coordinate'],
      include: [
        {
          model: models.Booking,
          as: 'bookings',
          where: where,
        },
      ],
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    });

    _response.json({
      result: chargerStations,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
