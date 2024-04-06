/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('lodash');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/booking/:bookingId',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const bookingId = _request.params.bookingId;

  // Querying 옵션1 - 언어 전체 조회
  const option = {
    include: [
      // User 테이블의 경우
      {
        model: models.UsersNew,
        as: 'createdBy',
        attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
      },
      {
        model: models.UsersNew,
        as: 'updatedBy',
        attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
      },
      // Vehicle 테이블의 경우
      {
        model: models.Vehicle,
        as: 'vehicle',
        attributes: ['id', 'manufacturer', 'type', 'usePnC'],
      },
      // Charging Station 테이블의 경우
      {
        model: models.sb_charging_station,
        as: 'chargingStation',
        attributes: ['chgs_id', 'chgs_name', 'coordinate'],
      },
      // SB_Charger 테이블의 경우
      {
        model: models.sb_charger,
        as: 'chargers',
        attributes: ['chg_id', 'chg_charger_id'],
      },
    ],
    exclude: ['createdWho', 'updatedWho', 'deletedAt'],
  };

  try {
    if (!bookingId) throw 'NO_BOOKING_ID';

    const booking = await models.Booking.findByPk(bookingId, option);
    if (!booking) throw 'NOT_EXIST_BOOKING';

    const _booking = _.cloneDeep(booking.dataValues);
    const day = new Date(_booking.b_date).toString().split(' ')[0] || null;
    const totalMinutes = convertMillisecondToMinute(new Date(_booking.b_time_out) - new Date(_booking.b_time_in));

    booking.dataValues.day = day;
    booking.dataValues.totalMinutes = totalMinutes;

    _response.json({
      result: booking,
    });
  } catch (e) {
    next(e);
  }
}

function convertMillisecondToMinute(millis) {
  return Math.floor(millis / 60000);
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NO_BOOKING_ID') {
    _response.error.notFound(_error, '소속 ID가 입력되지 않았습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_BOOKING') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
