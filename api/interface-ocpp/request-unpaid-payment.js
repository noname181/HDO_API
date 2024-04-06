'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { HTTP_STATUS_CODE } = require('../../middleware/newRole.middleware');
const { payRequestFromKICC } = require('../../util/paymentUtil');

module.exports = {
  path: ['/request-unpaid-payment'],
  method: 'post',
  checkToken: true,
  roles: [USER_ROLE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { clId, cardId } = _request.body;
  const { user } = _request;

  try {
    const unpaidPayment = await models.sb_charging_log.findOne({
      where: {
        [sequelize.Op.and]: [
          { usersNewId: user.id },
          { cl_id: clId },
          models.sequelize.literal(
            `NOT EXISTS (SELECT 1 FROM PaymentNotifications WHERE sb_charging_log.pg_cno = PaymentNotifications.cno)`
          ),
        ],
      },
      include: [
        {
          model: models.sb_charger,
          foreignKey: 'chg_id',
          paranoid: false,
          attributes: ['mall_id'],
          as: 'chargerUseLog',
        },
      ],
    });

    if (!unpaidPayment) {
      throw 'NOT_UNPAID_PAYMENT';
    }

    const cardOwner = await models.BankCard.findOne({
      where: {
        [sequelize.Op.and]: [{ userId: user.id }, { id: cardId }],
      },
    });

    if (!cardOwner) {
      throw 'USER_NOT_CARD_OWNER';
    }

    // totalPrice만큼 결제 진행
    const totalPrice = unpaidPayment.dataValues.appliedUnitPrice * unpaidPayment.dataValues.cl_kwh * 0.001;
    const kBillingKey = cardOwner.dataValues.billingKey;
    const mallId = unpaidPayment.dataValues.chargerUseLog.mall_id;

    if (totalPrice > 0) {
      if (kBillingKey) {
        //   // 실패 시 다른 빌링키로 결제 진행
        let isPayRequestSuccess = false;

        const paymentResult = await payRequestFromKICC(parseInt(totalPrice), kBillingKey, mallId);

        // * LOG KICC data
        try {
          const cardLogData = {
            url: _request.url,
            content: paymentResult,
            userId: _request.user.id,
          };
          console.log('pay method approval::service::store log::success', paymentResult);
          await models.AllLogs.create(cardLogData);
        } catch (err) {
          console.log('pay method approval::service::store log::err', err);
        }

        if (paymentResult.resCd === '0000') {
          // 결제 성공
          isPayRequestSuccess = true;
        }

        if (!isPayRequestSuccess) {
          _response.json({
            status: '200',
            message: '결제에 실패하여 미수기록을 작성하였습니다.',
          });
          return;
        } else {
          // TODO 결제 성공 시 3lvl 알림 전송
          await models.sb_charging_log.update(
            {
              pg_cno: paymentResult.pgCno,
            },
            { where: { cl_id: clId } }
          );

          await models.PaymentNotification.create({
            amount: totalPrice,
            createdAt: new Date(),
            res_cd: paymentResult.resCd,
            res_msg: paymentResult.resMsg,
            cno: paymentResult.pgCno,
            order_no: paymentResult.shopOrderNo,
            tran_date: parseTimestamp(paymentResult.transactionDate),
            card_no: cardOwner.dataValues.cardNo,
            stat_cd: paymentResult.statusCode,
            stat_msg: paymentResult.statusMessage,
            pay_type: paymentResult.paymentInfo.payMethodTypeCode,
            memb_id: paymentResult.mallId,
            noti_type: '10',
          });

          _response.json({
            status: '200',
            message: '결제에 성공하였습니다.',
          });
          return;
        }
      } else {
        throw 'MISSING_BILLING_KEY_ON_CARD';
      }
    } else {
      throw 'CANNOT_PAY_WITH_TOTAL_PRICE_0';
    }
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  const { body } = _request;

  if (!body.clId || !body.cardId) {
    throw 'NO_REQUIRED_INPUT';
  }

  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NO_REQUIRED_INPUT') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '필수 입력 정보가 누락되었습니다.',
    });
  }

  if (_error === 'NOT_UNPAID_PAYMENT') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '미지급 거래가 없습니다.',
    });
  }

  if (_error === 'USER_NOT_CARD_OWNER') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '이 카드의 소유주가 아닙니다.',
    });
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

function parseTimestamp(input) {
  const matches = input.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!matches || matches.length != 7) throw new Error('unexpected timestamp format sent from EasyPay');

  const result = new Date(0);
  result.setFullYear(parseInt(matches[1]));
  result.setMonth(parseInt(matches[2]) - 1);
  result.setDate(parseInt(matches[3]));
  result.setHours(parseInt(matches[4]));
  result.setMinutes(parseInt(matches[5]));
  result.setSeconds(parseInt(matches[6]));

  return result;
}
