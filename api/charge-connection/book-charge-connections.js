const models = require('../../models');
const _ = require('lodash');
const { USER_ROLE } = require('../../middleware/role.middleware');
const pgConfig = require('../paymethod/config');
const moment = require('moment');
const axios = require('axios');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/charge-connections/booking',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function makeBooking(body) {
  const method = 'POST';
  const url = pgConfig.easypayApiHost + '/api/trades/approval/batch';
  const headers = { 'Content-Type': 'application/json' };

  try {
    const response = await axios.post(url, body, {
      headers: headers,
    });

    if (response.status >= 400 || response.data.resCd !== '0000') {
      throw response.data.resMsg;
    }

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

function createTransactionID(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(date.getFullYear()).slice(2);
  const postfix = String(date.getTime());
  return `booking-${year}${month}${day}-${postfix}`;
}

function currentDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(date.getFullYear());
  return `${year}${month}${day}`;
}

async function service(_request, _response, next) {
  const body = _request.body;
  const userId = _request.user.id || _request.user.sub;
  const transaction = await models.sequelize.transaction();
  try {
    const bookingPayload = _.pick(body, ['chg_id', 'chgs_id', 'cardId', 'chargeAmount']);
    if (!bookingPayload.cardId) throw '카드를 선택하지 않았습니다.';
    const bankCard = await models.BankCard.findOne({
      where: {
        id: bookingPayload.cardId,
      },
    });

    if (!bankCard) {
      throw 'Card not exists.';
    } else {
      if (bankCard.userId != userId) throw '카드 소유주가 아닙니다.';
    }

    const verhicle = await models.Vehicle.findOne({
      where: {
        usersNewId: userId,
        isPrimary: true,
      },
    });
    if (!verhicle) {
      throw '등록된 차량이 없습니다';
    }
    const nowHour = moment().tz('Asia/Seoul').hours();
    bookingPayload.vehicleId = verhicle.id;
    bookingPayload.userId = userId;
    bookingPayload.createdWho = userId;
    bookingPayload.updatedWho = userId;
    bookingPayload.scanType = body.scanType || 1;
    bookingPayload.chargeType = body.chargeType || 1;
    bookingPayload.totalPrice = 0;
    bookingPayload.b_time_in = new Date();
    bookingPayload.b_date = new Date();
    bookingPayload.updatedAt = bookingPayload.createdAt = new Date();
    bookingPayload.b_status = 'selected';
    bookingPayload.b_time_out = moment(bookingPayload.b_time_in).add(1, 'hour').format();

    //caculate unit price
    const sb_charger = await models.sb_charger.findOne({
      where: {
        chg_id: body.chg_id,
      },
    });

    const memberDiscount = await models.Config.findOne({
      where: {
        divCode: 'MEMBER_DISC',
      },
    });

    if (sb_charger.usePreset == 'Y') {
      const priceSet = await models.UnitPriceSet.findOne({
        where: {
          id: sb_charger.upSetId,
        },
      });
      bookingPayload.unitPrice = priceSet[`unitPrice${nowHour + 1}`] - memberDiscount.cfgVal;
    } else if (sb_charger.usePreset == 'N') {
      bookingPayload.unitPrice = sb_charger.chg_unit_price - memberDiscount.cfgVal;
    }

    const parkDeposit = await models.Config.findOne({
      where: {
        divCode: 'PARK_DEPOSIT',
      },
    });
    bookingPayload.maxParkFee = parkDeposit.cfgVal;

    // 1. chargeType = 1
    // chargeAmount = Vehicles.batteryCap * (input %) / 100

    // 2. chargeType = 2
    // chargeAmount = input kwh

    // 3. chargeType = 3
    // chargeAmount = input money / unitPrice

    if (bookingPayload.chargeType == 1) {
      bookingPayload.chargeAmountKwh = (verhicle.batteryCap * bookingPayload.chargeAmount) / 100;
    } else if (bookingPayload.chargeType == 2) {
      bookingPayload.chargeAmountKwh = bookingPayload.chargeAmount;
    } else if (bookingPayload.chargeType == 3) {
      bookingPayload.chargeAmountKwh = bookingPayload.chargeAmount / bookingPayload.unitPrice;
    }

    bookingPayload.totalPrice = bookingPayload.chargeAmountKwh * bookingPayload.unitPrice;

    const newBooking = await models.Booking.create(bookingPayload, {
      transaction: transaction,
    });

    if (newBooking.scanType === 1 && newBooking.totalPrice > 0) {
      const transactionID = createTransactionID(new Date());
      const shopOrderNo = 'order-' + transactionID;
      const kiccRes = await makeBooking({
        mallId: pgConfig.easypayMallId,
        shopTransactionId: transactionID,
        shopOrderNo: shopOrderNo,
        amount: Number(newBooking.totalPrice) + Number(newBooking.maxParkFee),
        orderInfo: { goodsName: 'New Booking' },
        payMethodInfo: { billKeyMethodInfo: { batchKey: bankCard.billingKey } },
        approvalReqDate: currentDate(),
      });
      await models.PaymentLog.create(
        {
          payStatus: 'PAID',
          payType: 'CHG',
          userId: userId,
          chgs_id: body.chgs_id,
          chg_id: body.chg_id,
          bookingId: newBooking.id,
          chargeFee: bookingPayload.totalPrice,
          parkFee: bookingPayload.maxParkFee,
          kicc_return: kiccRes,
        },
        {
          transaction: transaction,
        }
      );
    }

    const chargerModel = await models.ChargerModel.findOne({
      where: {
        id: sb_charger.chargerModelId,
      },
    });
    if (!chargerModel) {
      throw 'CHARGER_INVALID';
    }

    const chargeConnectionPayload = _.pick(body, ['chg_id', 'chgs_id', 'chargeAmount']);
    chargeConnectionPayload.createdWho = userId;
    chargeConnectionPayload.updatedWho = userId;
    chargeConnectionPayload.chargedAmount = 0;
    chargeConnectionPayload.usersNewId = userId;
    chargeConnectionPayload.chargeStatus = 'selected';
    chargeConnectionPayload.selectedTime = new Date();
    chargeConnectionPayload.startTime = new Date();
    chargeConnectionPayload.updatedAt = chargeConnectionPayload.createdAt = new Date();
    chargeConnectionPayload.bookingId = newBooking.id;
    chargeConnectionPayload.chargeAmountKwh = bookingPayload.chargeAmountKwh;
    chargeConnectionPayload.chargeAmountPercent = Math.ceil(
      (bookingPayload.chargeAmountKwh / verhicle.batteryCap) * 100
    );
    chargeConnectionPayload.estimateMinutes = Math.ceil(
      (chargeConnectionPayload.chargeAmount / chargerModel.maxKw) * 60
    );
    chargeConnectionPayload.endTime = chargeConnectionPayload.estimateTime = moment(new Date())
      .add(chargeConnectionPayload.estimateMinutes, 'minutes')
      .format();
    const newConnection = await models.sb_charge_connection.create(chargeConnectionPayload, {
      transaction: transaction,
    });
    await transaction.commit();

    _response.json({
      result: {
        newConnection,
      },
    });
  } catch (e) {
    await transaction.rollback();
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
