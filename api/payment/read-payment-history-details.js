'use strict';
const { Op } = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { cardNoMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment/history/details'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 20;
  const odby = _request.query.odby ? _request.query.odby.toUpperCase() : 'DESC';

  const searchKey = _request.query.searchKey ? _request.query.searchKey.trim() : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal.trim() : '';
  const startDate = _request.query.startDate ? _request.query.startDate : '';
  const endDate = _request.query.endDate ? _request.query.endDate : '';

  try {
    const SEARCH_KEY = {
      CHGS_STATION_ID: 'chgs_station_id',
      CHG_STATION_NAME: 'chgs_name',
      CHG_ID: 'chg_charger_id',
      ADDRESS: 'address',
      MANAGER: 'manager',
      ACCOUNT_ID: 'accountId',
      USERNAME: 'user_name',
      RECEIVE_PHONE: 'receivePhoneNo',
      MODEL_NAME: 'modelName',
      CARD_NO: 'card_no',
    };

    const paymentNotificationWhere = {
      [Op.and]: [],
    };

    if (startDate || endDate) {
      if (startDate && endDate) {
        paymentNotificationWhere[Op.and].push(
          models.sequelize.literal(
            `PaymentNotification.createdAt >= '${startDate} 00:00:00' AND PaymentNotification.createdAt <= '${endDate} 23:59:59'`
          )
        );
      } else if (startDate) {
        paymentNotificationWhere[Op.and].push(
          models.sequelize.literal(`PaymentNotification.createdAt >= '${startDate} 00:00:00'`)
        );
      } else if (endDate) {
        paymentNotificationWhere[Op.and].push(
          models.sequelize.literal(`PaymentNotification.createdAt <= '${endDate} 23:59:59'`)
        );
      }
    }

    let paymentIncludeDb = [
      {
        model: models.sb_charging_log,
        // where: {
        //   '$PaymentNotification.noti_type$': 10
        // },
        // required: false,
        as: 'chargingLogs',
        paranoid: false,
        attributes: {
          exclude: ['deletedAt', 'userId', 'chgs_id', 'chg_id'],
        },
        include: [
          {
            model: models.UsersNew,
            foreignKey: 'usersNewId',
            paranoid: false,
            attributes: { exclude: ['deletedAt'] },
            as: 'userNew',
          },
        ],
      },
      {
        model: models.sb_charger,
        // where: {
        //   '$PaymentNotification.noti_type$': 10
        // },
        // required: false,
        paranoid: false,
        attributes: { exclude: ['deletedAt'] },
        as: 'sb_charger_memb',
        include: [
          {
            model: models.ChargerModel,
            foreignKey: 'chargerModelId',
            attributes: { exclude: ['deletedAt'] },
            as: 'chargerModel',
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
                paranoid: false,
                attributes: [
                  'id',
                  'category',
                  'fullname',
                  'name',
                  'bizRegNo',
                  'address',
                  'contactName',
                  'contactPhoneNo',
                  'contactEmail',
                  'deductType',
                  'discountPrice',
                  'staticUnitPrice',
                  'payMethodId',
                  'isPayLater',
                  'isLocked',
                  'billingDate',
                  'closed',
                  'area',
                  'branch',
                  'haveCarWash',
                  'haveCVS',
                  'STN_STN_SEQ',
                  'STN_STN_ID',
                  'STN_STN_GUBUN',
                  'STN_CUST_NO',
                  'STN_ASSGN_AREA_GUBUN',
                  'STN_COST_CT',
                  'STN_PAL_CT',
                  'STN_STN_SHORT_NM',
                  'erp',
                  'createdAt',
                  'updatedAt',
                  [
                    models.sequelize.literal(
                      `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`
                    ),
                    'branchName',
                  ],
                  [
                    models.sequelize.literal(
                      "(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)"
                    ),
                    'areaName',
                  ],
                  'region',
                ],
                as: 'org',
              },
            ],
          },
        ],
      },
    ];

    switch (searchKey) {
      case SEARCH_KEY.CHGS_STATION_ID:
        paymentNotificationWhere[Op.and].push({
          '$sb_charger_memb.chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.CHG_STATION_NAME:
        paymentNotificationWhere[Op.and].push({
          '$sb_charger_memb.chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.CHG_ID:
        paymentNotificationWhere[Op.and].push({
          '$sb_charger_memb.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.ACCOUNT_ID:
        paymentNotificationWhere[Op.and].push({
          '$chargingLogs.userNew.accountId$': searchVal,
        });
        break;
      case SEARCH_KEY.USERNAME:
        paymentNotificationWhere[Op.and].push({
          '$chargingLogs.userNew.name$': searchVal,
        });
        break;
      case SEARCH_KEY.ADDRESS:
        paymentNotificationWhere[Op.and].push({
          '$sb_charger_memb.chargingStation.org.address$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.MANAGER:
        paymentNotificationWhere[Op.and].push({
          '$sb_charger_memb.chargingStation.org.contactName$': searchVal,
        });
        break;
      case SEARCH_KEY.MODEL_NAME:
        paymentNotificationWhere[Op.and].push({
          '$sb_charger_memb.chargerModel.modelName$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.RECEIVE_PHONE:
        paymentNotificationWhere[Op.and].push(
          {
            '$chargingLogs.receivePhoneNo$': searchVal,
          },
          models.Sequelize.literal(`((IFNULL(
          (
            SELECT receivePhoneNo
            FROM sb_charging_logs
            WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
            LIMIT 1),
          (
            SELECT phone
            FROM sb_charge_local_ic_pays
            WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
            LIMIT 1)
          ) LIKE '%${searchVal}%') OR ((
            SELECT receivePhoneNo
            FROM sb_charging_logs
            WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
            LIMIT 1) LIKE '%${searchVal}%'))`)
        );
        break;
      case SEARCH_KEY.CARD_NO:
        paymentNotificationWhere[Op.and].push({
          card_no: { [Op.like]: '%' + searchVal + '%' },
        });
        // if (formatSearchCardNoKeyword(searchVal)) {
        //   paymentNotificationWhere[Op.and].push(
        //     models.sequelize.literal(`SUBSTRING(PaymentNotification.card_no, 5, 4) = '${
        //       formatSearchCardNoKeyword(searchVal)[0]
        //     }
        //     AND SUBSTRING(PaymentNotification.card_no, 13, 3) = '${formatSearchCardNoKeyword(searchVal)[1]}'`)
        //   );
        // }
        break;
      default:
        if (searchVal) {
          paymentNotificationWhere[Op.and].push({
            [Op.or]: [
              { '$sb_charger_memb.chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$sb_charger_memb.chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } },
              { '$sb_charger_memb.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$chargingLogs.userNew.accountId$': searchVal },
              { '$chargingLogs.userNew.name$': searchVal },
              { '$sb_charger_memb.chargingStation.org.address$': { [Op.like]: '%' + searchVal + '%' } },
              { '$sb_charger_memb.chargingStation.org.contactName$': searchVal },
              { '$sb_charger_memb.chargerModel.modelName$': { [Op.like]: '%' + searchVal + '%' } },

              models.Sequelize.literal(`((IFNULL(
                (
                  SELECT receivePhoneNo
                  FROM sb_charging_logs
                  WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
                  LIMIT 1),
                (
                  SELECT phone
                  FROM sb_charge_local_ic_pays
                  WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
                  LIMIT 1)
                ) LIKE '%${searchVal}%') OR ((
                  SELECT receivePhoneNo
                  FROM sb_charging_logs
                  WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
                  LIMIT 1) LIKE '%${searchVal}%'))`),
              { '$chargingLogs.appliedUnitPrice$': searchVal },
              { card_no: { [Op.like]: '%' + searchVal + '%' } },
              // { '$chargingLogs.userNew.phoneNo$': searchVal },
              { '$chargingLogs.receivePhoneNo$': searchVal },
              // formatSearchCardNoKeyword(searchVal)
              //   ? models.sequelize.literal(
              //       `SUBSTRING(PaymentNotification.card_no, 5, 4) = '${formatSearchCardNoKeyword(searchVal)[0]}'
              //       AND SUBSTRING(PaymentNotification.card_no, 13, 3) = '${formatSearchCardNoKeyword(searchVal)[1]}'`
              //     )
              //   : null,
            ],
          });
        }
        break;
    }

    if (_request.query.area)
      paymentNotificationWhere[Op.and].push(
        models.sequelize.literal(
          `(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1) = '${_request.query.area}' `
        )
      );
    if (_request.query.branch)
      paymentNotificationWhere[Op.and].push({
        '$sb_charger_memb.chargingStation.org.branch$': _request.query.branch,
      });
    if (_request.query.category)
      paymentNotificationWhere[Op.and].push({
        '$sb_charger_memb.chargingStation.org.category$': _request.query.category,
      });
    if (_request.query.speed)
      paymentNotificationWhere[Op.and].push({
        '$sb_charger_memb.chargerModel.maxKw$': _request.query.speed,
      });
    if (_request.query.member)
      paymentNotificationWhere[Op.and].push({
        '$chargingLogs.usersNewId$': _request.query.member === 'N' ? { [Op.is]: null } : { [Op.not]: null },
      });

    let { count: totalCount, rows: paymentsData } = await models.PaymentNotification.findAndCountAll({
      attributes: {
        include: [
          [
            models.sequelize.literal(
              '(SELECT card_no FROM PaymentNotifications WHERE cno = PaymentNotification.cno AND noti_type = 10 LIMIT 1)'
            ),
            'card_no_noti10',
          ],
          [
            models.sequelize.literal(
              '(SELECT issuer_nm FROM PaymentNotifications WHERE cno = PaymentNotification.cno AND noti_type = 10 LIMIT 1)'
            ),
            'issuer_nm_noti10',
          ],
        ],
      },
      where: paymentNotificationWhere,
      include: paymentIncludeDb,
      group: ['PaymentNotification.id'],
      order: [['createdAt', odby]],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
      subQuery: false,
    });

    const payments = [];

    for (let item of paymentsData) {
      if (item.dataValues.chargingLogs && item.dataValues.chargingLogs.cl_kwh)
        item.dataValues.chargingLogs.cl_kwh = formatKwh(item.dataValues.chargingLogs.cl_kwh);
      if (item.dataValues.chargingLogs && item.dataValues.chargingLogs.ignored_kwh)
        item.dataValues.chargingLogs.ignored_kwh = formatKwh(item.dataValues.chargingLogs.ignored_kwh);
      if (item.dataValues.chargingLogs && item.dataValues.chargingLogs.desired_kwh)
        item.dataValues.chargingLogs.desired_kwh = formatKwh(item.dataValues.chargingLogs.desired_kwh);
      const newItem = { ...item.dataValues };
      payments.push({
        ...newItem,
        card_no: cardNoMask(item.card_no),
      });
    }

    const calcTotalPayment = await models.PaymentNotification.findOne({
      where: paymentNotificationWhere,
      include: paymentIncludeDb,
      attributes: [
        [models.sequelize.literal('SUM(CASE WHEN noti_type = "10" THEN amount ELSE 0 END)'), 'totalAmount'],
        [models.sequelize.literal('SUM(CASE WHEN noti_type = "20" THEN mgr_amt ELSE 0 END)'), 'totalRefund'],
      ],
    });

    let totalAmount = calcTotalPayment.dataValues?.totalAmount ? calcTotalPayment.dataValues.totalAmount : 0;
    let totalRefund = calcTotalPayment.dataValues?.totalRefund ? calcTotalPayment.dataValues.totalRefund : 0;

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount: totalCount.length,
      result: payments,
      totalAmount,
      totalRefund,
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

function formatSearchCardNoKeyword(keyword) {
  // Check if the keyword is a number and has 7 digits
  if (/^\d{7}$/.test(keyword)) {
    // Format the string as "8700****383*"
    return [keyword.slice(0, 4), keyword.slice(-3)];
  } else {
    return false;
  }
}

function formatKwh(num) {
  if (!num) {
    return '';
  }
  return parseFloat(num / 1000).toFixed(2);
}
