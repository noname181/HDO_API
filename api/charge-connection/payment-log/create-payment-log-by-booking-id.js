'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: ['/charge-connections/payment/park-fee'],
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const bookingId = _request.query.bookingId;
  const body = _request.body;
  body.createdAt = body.updatedAt = new Date();

  try {
    //Find booking information
    if (!bookingId) throw 'NO_BOOKING_ID';

    const foundBooking = await models.Booking.findByPk(bookingId);
    if (!foundBooking) throw 'NOT_EXIST_BOOKING';

    const chargeConnection = await models.sb_charge_connection.findOne({
      where: { bookingId: bookingId },
    });
    if (!chargeConnection) throw 'NOT_EXIST_CHARGE_CONNECTION';

    //Find config
    const PARK_FEE_PER_MIN = await models.Config.findOne({
      where: { divCode: 'PARK_FEE_PER_MIN' },
    });

    const PARK_MAX_MIN = await models.Config.findOne({
      where: { divCode: 'PARK_MAX_MIN' },
    });

    const PARK_ALLOW_MIN = await models.Config.findOne({
      where: { divCode: 'PARK_ALLOW_MIN' },
    });

    const PARK_DEPOSIT = await models.Config.findOne({
      where: { divCode: 'PARK_DEPOSIT' },
    });

    if (!PARK_FEE_PER_MIN || !PARK_MAX_MIN || !PARK_ALLOW_MIN || !PARK_DEPOSIT) throw 'NOT_EXIST_CONFIG';

    //Caculate parking fee
    const { completedTime, endTime } = chargeConnection;
    const overParkingTime =
      convertMillisecondToMinute(new Date(completedTime) - new Date(endTime)) - parseInt(PARK_ALLOW_MIN.cfgVal);
    const { userId, chgs_id, chargerModelId } = foundBooking;
    const payload = {
      payStatus: 'PAID',
      payType: 'CHG',
      userId: userId,
      chgs_id: chgs_id,
      chg_id: chargerModelId,
      parkFee: 0,
      bookingId: bookingId,
    };

    if (overParkingTime > 0) {
      const parkingFee = overParkingTime * PARK_FEE_PER_MIN.cfgVal;
      payload.parkFee = parkingFee > PARK_DEPOSIT.cfgVal ? PARK_DEPOSIT.cfgVal : parkingFee;
    }

    const paymentLog = await models.PaymentLog.create(payload);
    paymentLog.save();

    _response.json({
      result: paymentLog,
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

  if (_error === 'NOT_EXIST_CHARGE_CONNECTION') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CONFIG') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
