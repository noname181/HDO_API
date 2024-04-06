'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/booking'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const { body } = _request;
    body.createdAt = body.updatedAt = new Date();

    if (!body.userId) {
      body.userId = _request.user.id;
      body.createdWho = _request.user.id;
      body.updatedWho = _request.user.id;
    } else {
      body.createdWho = body.userId;
      body.updatedWho = body.userId;
    }

    // Add vehicle to payload
    const vehicle = await models.Vehicle.findOne({
      where: {
        [Op.and]: [
          {
            usersNewId: body.userId,
          },
          { isPrimary: true },
        ],
      },
    });
    body.vehicleId = vehicle ? vehicle.dataValues.id : null;

    const booking = await models.Booking.create(body);
    booking.save();

    _response.json({
      result: booking,
    });
  } catch (e) {
    next(e);
  }
}

async function validator(_request, _response, next) {
  const { b_time_in, b_time_out, chg_id } = _request.body;

  if (Date.parse(b_time_in) >= Date.parse(b_time_out)) {
    next('Invalid Time');
  }

  const foundBooking = await models.Booking.findOne({
    where: {
      [Op.and]: [
        {
          chg_id,
        },
        {
          [Op.or]: [
            {
              b_time_in: {
                [Op.between]: [b_time_in, b_time_out],
              },
            },
            {
              b_time_out: {
                [Op.between]: [b_time_in, b_time_out],
              },
            },
          ],
        },
      ],
    },
  });

  if (foundBooking) next('CONFLICT');
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'CONFLICT') {
    _response.error.badRequest(_error, '충전기가 이용가능하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
