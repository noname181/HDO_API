/**
 * Created by Sarc Bae on 2023-06-13.
 * 소속 수정 API
 */
'use strict';
require('dotenv').config();
const models = require('../../models');
const _ = require('lodash');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/charge-connections/charge',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chg_id = _request.query.chg_id;
  const { body } = _request;

  const payload = _.pick(body, [
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
    const chargeConnections = await models.sb_charge_connection.findOne({
      where: {
        chg_id: chg_id,
      },
      order: [['id', 'DESC']],
    });
    if (!chargeConnections) throw 'NOT_EXIST_CHARGE_CONNECTION';

    // 전달된 body로 업데이트
    await chargeConnections.update(payload, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // // 업데이트된 소속 정보 새로고침
    // const reloadChargeConnection = await chargeConnections.reload({
    //   include: [
    //     // User 테이블의 경우
    //     {
    //       model: models.UsersNew,
    //       as: 'createdBy',
    //       attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
    //     },
    //     {
    //       model: models.UsersNew,
    //       as: 'updatedBy',
    //       attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
    //     },
    //   ],
    //   attributes: {
    //     exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    //   },
    //   transaction: transaction,
    // });

    // const omitFields = [
    //   'scanType',
    //   'chargeType',
    //   'membershipOrNot',
    //   'chargeUnitPrice',
    //   'remainTime',
    //   'selectedTime',
    //   'chargeCost',
    //   'regtime',
    //   'estimatePaymentAmount',
    //   'chargeAmount',
    //   'couponPrice',
    // ];

    // const result = _.omit(reloadChargeConnection.dataValues, omitFields);

    // await transaction.commit();

    // // 수정된 정보 응답
    // _response.json({
    //   result,
    // });

    let options = {
      where: {
        chg_id: chg_id,
      },
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
          attributes: ['chargeType', 'unitPrice', 'totalPrice'],
        },
      ],
      order: [['id', 'DESC']],
    };

    _response.json(await models.sb_charge_connection.findOne(options));
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  const OCCP_KEY = process.env.OCCP_SECRET_KEY;
  const { key } = _request.query;

  if (OCCP_KEY !== key) {
    next('유효하지 않은 occp 키');
  }
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CHARGE_CONNECTION') {
    _response.error.notFound(_error, '해당 ID에 대한 FAQ 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
