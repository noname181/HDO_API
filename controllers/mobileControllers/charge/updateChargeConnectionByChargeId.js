'use strict';
const pick = require('lodash/pick');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');

const updateChargeConnectionByChargeId = {
  path: '/charge-connections/charge',
  method: 'put',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { query, body } = request;
  const chg_id = query.chg_id.toString().trim() || '';

  const payload = pick(body, [
    'chg_id',
    'currentBatteryPercent',
    'timeCharged',
    'startTime',
    'estimateTime',
    'endTime',
    'chargeAmountKwh',
    'chargeAmountPercent',
    'chargeStatus',
    'canceledTime',
    'completedTime',
  ]);

  try {
    const result = await models.sequelize.transaction(async (t) => {
      const chargeConnection = await models.sb_charge_connection.findOne(
        {
          where: {
            chg_id,
          },
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: models.Booking,
              as: 'booking',
              attributes: ['id', 'b_status', 'chargeType', 'unitPrice', 'totalPrice'],
            },
          ],
        },
        { transaction: t }
      );

      if (!chargeConnection) {
        throw 'NOT_EXIST_CHARGE_CONNECTION';
      }

      const status = findBookingStatus(payload.chargeStatus);
      await models.sb_charge_connection.update(
        {
          ...payload,
          chargeStatus: status || undefined,
        },
        { where: { id: chargeConnection.id } },
        { transaction: t }
      );

      const bookingId = chargeConnection.booking.id;
      if (bookingId) {
        await models.Booking.update(
          {
            b_status: status || undefined,
          },
          {
            where: {
              id: bookingId,
            },
          },
          { transaction: t }
        );
      }

      const options = {
        attributes: [
          'chg_id',
          'currentBatteryPercent',
          'timeCharged',
          'startTime',
          'estimateTime',
          'endTime',
          'chargeAmountKwh',
          'chargeAmountPercent',
          'chargeStatus',
        ],
        include: [
          {
            model: models.sb_charger,
            as: 'charger',
            attributes: ['chg_id', 'chg_charger_id'],
            include: [
              {
                model: models.ChargerModel,
                as: 'chargerModel',
                attributes: ['id', 'maxKw', 'speedType'],
              },
            ],
          },
          {
            model: models.sb_charging_station,
            as: 'chargingStation',
            attributes: ['chgs_id', 'chgs_station_id', 'chgs_name'],
          },
          {
            model: models.Booking,
            as: 'booking',
            attributes: ['id', 'b_status', 'chargeType', 'unitPrice', 'totalPrice', 'maxParkFee'],
          },
        ],
        order: [['id', 'DESC']],
      };

      return await chargeConnection.reload(options, { transaction: t });
    });

    return response.status(HTTP_STATUS_CODE.OK).json(result);
  } catch (error) {
    console.error('updateChargeConnectionByChargeId::service::', error);
    return next('UPDATE_ERROR');
  }
}

function validator(occpKey) {
  return (request, response, next) => {
    const { query } = request;
    const occpKeyFromRequest = query.key.toString().trim() || '';

    const isValidOccpKey = occpKey && occpKeyFromRequest && occpKey === occpKeyFromRequest;
    if (!isValidOccpKey) {
      return next('INVALID_OCCP_KEY');
    }

    next();
  };
}

function errorHandler(error, request, response, next) {
  if (error === 'INVALID_OCCP_KEY') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유효하지 않은 occp 키',
    });
  }

  if (error === 'NOT_EXIST_CHARGE_CONNECTION') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '해당 ID에 대한 FAQ 존재하지 않습니다.',
    });
  }

  if (error === 'UPDATE_ERROR') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '충전 연결 업데이트 중 오류 발생',
    });
  }

  next();
}

const BOOKING_STATUS = {
  SELECTED: 'selected',
  TERMINATED: 'terminated',
  RESERVED: 'reserved',
  CHARGING: 'charging',
  COMPLETE: 'completed',
  CANCELLED: 'cancelled',
};
const findBookingStatus = (status) => {
  return BOOKING_STATUS[status.toUpperCase()] || '';
};

module.exports = { updateChargeConnectionByChargeId };
