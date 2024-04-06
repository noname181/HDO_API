'use strict';
const { Op, QueryTypes, Sequelize } = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { cardNoMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment/history'],
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
  const startDate = _request.query.startDate ? _request.query.startDate + ' 00:00:00' : '';
  const endDate = _request.query.endDate ? _request.query.endDate + ' 23:59:59' : '';

  try {
    const SEARCH_KEY = {
      CHGS_STATION_ID: 'chgs_station_id',
      CHG_STATION_NAME: 'chgs_name',
      CHG_ID: 'chg_charger_id',
      ACCOUNT_ID: 'accountId',
      USERNAME: 'user_name',
      PHONE: 'phoneNo',
      RECEIVE_PHONE: 'receivePhoneNo',
      CARD_NO: 'card_no',
      APPLIED_UNIT_PRICE: 'appliedUnitPrice',
    };

    const paymentNotificationWhere = {
      [Op.and]: [{ noti_type: '10' }],
    };

    if (startDate || endDate) {
      // if (startDate && endDate) {
      //   paymentNotificationWhere[Op.and].push({ createdAt: { [Op.between]: [startDate, endDate] } });
      // } else if (startDate) {
      //   paymentNotificationWhere[Op.and].push({ createdAt: { [Op.gte]: startDate } });
      // } else if (endDate) {
      //   paymentNotificationWhere[Op.and].push({ createdAt: { [Op.lte]: endDate } });
      // }
      if (startDate && endDate) {
        paymentNotificationWhere[Op.and].push(
          models.sequelize.literal(` (PaymentNotification.createdAt between '${startDate}' and '${endDate}') `)
        );
      } else if (startDate) {
        paymentNotificationWhere[Op.and].push(
          models.sequelize.literal(` (PaymentNotification.createdAt >= '${startDate}') `)
        );
      } else if (endDate) {
        paymentNotificationWhere[Op.and].push(
          models.sequelize.literal(` (PaymentNotification.createdAt <= '${endDate}') `)
        );
      }
    }

    let paymentIncludeDb = [
      {
        model: models.sb_charging_log,
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
                      `(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`
                    ),
                    'areaName',
                  ],
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
      case SEARCH_KEY.PHONE:
        paymentNotificationWhere[Op.and].push({
          '$chargingLogs.userNew.phoneNo$': searchVal,
        });
        break;
      case SEARCH_KEY.RECEIVE_PHONE:
        paymentNotificationWhere[Op.and].push(
          /*{
          '$chargingLogs.receivePhoneNo$': searchVal,
        }*/
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
      case SEARCH_KEY.APPLIED_UNIT_PRICE:
        paymentNotificationWhere[Op.and].push({
          '$chargingLogs.appliedUnitPrice$': searchVal,
        });
        break;
      case SEARCH_KEY.CARD_NO:
        paymentNotificationWhere[Op.and].push({
          card_no: { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      // if (formatSearchCardNoKeyword(searchVal)) {
      //     paymentNotificationWhere[Op.and].push(
      //     models.sequelize.literal(`SUBSTRING(PaymentNotification.card_no, 5, 4) = '${formatSearchCardNoKeyword(searchVal)[0]}'
      //   AND SUBSTRING(PaymentNotification.card_no, 13, 3) = '${formatSearchCardNoKeyword(searchVal)[1]}'`)
      //     );

      // }
      // break;
      default:
        if (searchVal) {
          paymentNotificationWhere[Op.and].push({
            [Op.or]: [
              { '$sb_charger_memb.chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$sb_charger_memb.chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } },
              { '$sb_charger_memb.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$chargingLogs.userNew.accountId$': searchVal },
              { '$chargingLogs.userNew.name$': searchVal },
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
              // { '$chargingLogs.receivePhoneNo$': searchVal },
              // { '$chargingLogs.userNew.phoneNo$': searchVal },
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

    const { count: totalCount, rows: paymentsData } = await models.PaymentNotification.findAndCountAll({
      attributes: [
        'id',
        'res_cd',
        'res_msg',
        'cno',
        'order_no',
        'amount',
        'auth_no',
        'tran_date',
        'card_no',
        'issuer_cd',
        'issuer_nm',
        'acquirer_cd',
        'acquirer_nm',
        'noint',
        'install_period',
        'used_pnt',
        'escrow_yn',
        'complex_yn',
        'stat_cd',
        'stat_msg',
        'van_tid',
        'van_sno',
        'pay_type',
        'memb_id',
        'noti_type',
        'part_cancel_yn',
        'memb_gubun',
        'card_gubun',
        'card_biz_gubun',
        'cpon_flag',
        'cardno_hash',
        'sub_card_cd',
        'bk_pay_yn',
        'remain_pnt',
        'accrue_pnt',
        'canc_date',
        'mgr_amt',
        'mgr_card_amt',
        'mgr_cpon_amt',
        'mgr_seqno',
        'mgr_req_msg',
        'day_rem_pnt',
        'month_rem_pnt',
        'day_rem_cnt',
        'createdAt',
        [
          models.sequelize.literal(`
            (SELECT 
              (SUM(CASE WHEN pn.noti_type = '10' THEN pn.amount ELSE 0 END) -
              SUM(CASE WHEN pn.noti_type = '20' THEN pn.mgr_amt ELSE 0 END)) AS totalPayment
            FROM 
              PaymentNotifications AS pn  
            WHERE 
              (pn.noti_type = '10' OR pn.noti_type = '20') 
              AND pn.cno = PaymentNotification.cno) 
          `),
          'totalPayment',
        ],
      ],
      where: paymentNotificationWhere,
      include: paymentIncludeDb,
      order: [['createdAt', odby]],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
      group: ['PaymentNotification.id'],
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
    const totalKwh = await models.PaymentNotification.findOne({
      attributes: [
        [
          models.sequelize.fn(
            'ROUND',
            models.sequelize.fn('SUM', models.sequelize.literal('COALESCE(chargingLogs.cl_kwh, 0)/1000')),
            2
          ),
          'sumCL',
        ],
        // [
        //   models.sequelize.fn('ROUND', models.sequelize.fn('SUM', models.sequelize.literal('(COALESCE(chargingLogs.cl_kwh, 0)/1000) + (COALESCE(chargingLogs.ignored_kwh, 0)/1000)')), 2),
        //   'sumIgnoredKwh'
        // ],
      ],
      where: paymentNotificationWhere,
      include: paymentIncludeDb,
    });

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount: totalCount.length,
      totalClKwh: totalKwh?.dataValues?.sumCL?.toFixed(2) || 0,
      // totalIgnoredKwh: totalKwh?.dataValues?.sumIgnoredKwh?.toFixed(2) || 0,
      result: payments,
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
    // Format the string as '8700****383*'
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
