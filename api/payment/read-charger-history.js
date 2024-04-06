'use strict';
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const { cardNoMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const Op = sequelize.Op;
module.exports = {
  path: ['/payment/charger-history'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const odby = _request.query.odby ? _request.query.odby.toUpperCase() : 'DESC';

  const searchKey = _request.query.searchKey ? _request.query.searchKey.trim() : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal.trim() : '';
  const startDate = _request.query.startDate ? _request.query.startDate + ' 00:00:00' : '';
  const endDate = _request.query.endDate ? _request.query.endDate + ' 23:59:59' : '';
  const startPaymentDate = _request.query.startPaymentDate ? _request.query.startPaymentDate + ' 00:00:00' : '';
  const endPaymentDate = _request.query.endPaymentDate ? _request.query.endPaymentDate + ' 23:59:59' : '';

  const SEARCH_KEY = {
    USER_NAME: 'member_name',
    USER_ID: 'member_id',
    CL_NO: 'cl_no',
    CHGS_STATION_ID: 'chgs_station_id',
    CHG_STATION_NAME: 'chgs_name',
    CHG_ID: 'chg_charger_id',
    RECEIVE_PHONE: 'receivePhoneNo',
    CARD_NO: 'card_no',
  };

  try {
    const where = {
      [Op.and]: [
        // {
        //   '$paymentNotification.noti_type$': '10',
        // },
        // { '$paymentNotification.auth_no$': { [Op.eq]: sequelize.col('approval_number') } },
      ],
    };

    if (_request.query.isCredit) {
      where[Op.and].push({ useType: _request.query.isCredit === 'Y' ? 'CREDIT' : { [Op.ne]: 'CREDIT' } });
    }
    let having = {};
    if (_request.query.payCompletedYN) { 
        where[Op.and].push({ cl_unplug_datetime: { [Op.ne]: null} }); 

      // if(_request.query.payCompletedYN === 'NO'){
      //   where[Op.and].push({ pg_cno: null });
      // } else if(_request.query.payCompletedYN === 'FAIL'){
      //   where[Op.and].push({ [Op.and]: [{payCompletedYN: 'N'}, {useType: 'CREDIT'}] });
      // } else {
      //   where[Op.and].push({ payCompletedYN: _request.query.payCompletedYN });
      // }
      
      if (_request.query.payCompletedYN === 'Y') {
        where[Op.and].push(
          models.Sequelize.literal(`
          (SELECT COUNT(id)
              FROM PaymentNotifications
              WHERE cno = sb_charging_log.pg_cno AND noti_type = 10 AND cno IS NOT NULL AND sb_charging_log.pg_cno IS NOT NULL 
              LIMIT 1
          ) > 0 
          AND 
          (SELECT COUNT(id)
              FROM PaymentNotifications
              WHERE cno = sb_charging_log.pg_cno AND noti_type = 20 AND cno IS NOT NULL AND sb_charging_log.pg_cno IS NOT NULL 
              LIMIT 1
          ) = 0 
          AND 
          sb_charging_log.cl_id NOT IN (SELECT sb_charging_log2.cl_id FROM sb_charging_logs AS sb_charging_log2 WHERE sb_charging_log2.payCompletedYN ='N' AND sb_charging_log2.useType =  'CREDIT')`)
        );
      }
      if (_request.query.payCompletedYN === 'N') {
        where[Op.and].push(
          models.Sequelize.literal(`
          paymentNotification.cno IS NULL 
          AND 
          sb_charging_log.cl_id NOT IN (SELECT sb_charging_log2.cl_id FROM sb_charging_logs AS sb_charging_log2 WHERE sb_charging_log2.payCompletedYN ='N' AND sb_charging_log2.useType =  'CREDIT')`)
        );
      }
      if (_request.query.payCompletedYN === 'NO') {
        where[Op.and].push(
          models.Sequelize.literal(`
          (SELECT COUNT(id)
              FROM PaymentNotifications
              WHERE cno = sb_charging_log.pg_cno AND noti_type = 20 AND cno IS NOT NULL AND sb_charging_log.pg_cno IS NOT NULL 
              LIMIT 1
          ) > 0
          AND 
          sb_charging_log.cl_id NOT IN (SELECT sb_charging_log2.cl_id FROM sb_charging_logs AS sb_charging_log2 WHERE sb_charging_log2.payCompletedYN ='N' AND sb_charging_log2.useType =  'CREDIT')`)
        );
      }
      if (_request.query.payCompletedYN === 'FAIL') {
        //  where[Op.and].push({ [Op.and]: [{ payCompletedYN: 'N' }, { useType: 'CREDIT' }] });
        where[Op.and].push(
          models.Sequelize.literal(`
        (SELECT COUNT(id)
            FROM PaymentNotifications
            WHERE cno = sb_charging_log.pg_cno AND noti_type = 10 AND cno IS NOT NULL AND sb_charging_log.pg_cno IS NOT NULL 
            LIMIT 1
        ) > 0 
        AND 
        (SELECT COUNT(id)
            FROM PaymentNotifications
            WHERE cno = sb_charging_log.pg_cno AND noti_type = 20 AND cno IS NOT NULL AND sb_charging_log.pg_cno IS NOT NULL 
            LIMIT 1
        ) = 0 
        AND sb_charging_log.payCompletedYN = 'N' AND sb_charging_log.useType = 'CREDIT'`)
        );
      }
    }

    if (startDate || endDate) {
      if (startDate && endDate) {
        where[Op.and].push({ cl_datetime: { [Op.between]: [startDate, endDate] } });
      } else if (startDate) {
        where[Op.and].push({ cl_datetime: { [Op.gte]: startDate } });
      } else if (endDate) {
        where[Op.and].push({ cl_datetime: { [Op.lte]: endDate } });
      }
    }

    if (startPaymentDate || endPaymentDate) {
      if (startPaymentDate && endPaymentDate) {
        where[Op.and].push({ '$paymentNotification.tran_date$': { [Op.between]: [startPaymentDate, endPaymentDate] } });
      } else if (startPaymentDate) {
        where[Op.and].push({ '$paymentNotification.tran_date$': { [Op.gte]: startPaymentDate } });
      } else if (endPaymentDate) {
        where[Op.and].push({ '$paymentNotification.tran_date$': { [Op.lte]: endPaymentDate } });
      }
    }

    switch (searchKey) {
      case SEARCH_KEY.CHGS_STATION_ID:
        where[Op.and].push({
          '$chargingStationUseLog.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.CHG_STATION_NAME:
        where[Op.and].push({
          '$chargingStationUseLog.chgs_name$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.CHG_ID:
        where[Op.and].push({
          '$chargerUseLog.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.USER_NAME:
        where[Op.and].push({
          '$userNew.name$': searchVal,
        });
        break;
      case SEARCH_KEY.USER_ID:
        where[Op.and].push({
          '$userNew.accountId$': searchVal,
        });
        break;
      case SEARCH_KEY.CL_NO:
        where[Op.and].push({
          cl_id: searchVal,
        });
        break;
      case SEARCH_KEY.RECEIVE_PHONE:
        where[Op.and].push(
          models.Sequelize.literal(`((IFNULL(
            (
              SELECT receivePhoneNo
              FROM sb_charging_logs
              WHERE pg_cno = paymentNotification.cno AND paymentNotification.noti_type = 10
              LIMIT 1),
            (
              SELECT phone
              FROM sb_charge_local_ic_pays
              WHERE pg_cno = paymentNotification.cno AND paymentNotification.noti_type = 10
              LIMIT 1)
            ) LIKE '%${searchVal}%') OR ((
              SELECT receivePhoneNo
              FROM sb_charging_logs
              WHERE pg_cno = paymentNotification.cno AND paymentNotification.noti_type = 10
              LIMIT 1) LIKE '%${searchVal}%'))`)
        );
        break;
      case SEARCH_KEY.CARD_NO:
        where[Op.and].push({ '$paymentNotification.card_no$': { [Op.like]: '%' + searchVal + '%' } });
        break;
      default:
        if (searchVal) {
          where[Op.and].push({
            [Op.or]: [
              { '$chargingStationUseLog.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$chargingStationUseLog.chgs_name$': { [Op.like]: '%' + searchVal + '%' } },
              { '$chargerUseLog.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$userNew.accountId$': searchVal },
              { '$userNew.name$': searchVal },
              { cl_id: searchVal },
              { '$paymentNotification.card_no$': { [Op.like]: '%' + searchVal + '%' } },
              models.Sequelize.literal(`((IFNULL(
                (
                  SELECT receivePhoneNo
                  FROM sb_charging_logs
                  WHERE pg_cno = paymentNotification.cno AND paymentNotification.noti_type = 10
                  LIMIT 1),
                (
                  SELECT phone
                  FROM sb_charge_local_ic_pays
                  WHERE pg_cno = paymentNotification.cno AND paymentNotification.noti_type = 10
                  LIMIT 1)
                ) LIKE '%${searchVal}%') OR ((
                  SELECT receivePhoneNo
                  FROM sb_charging_logs
                  WHERE pg_cno = paymentNotification.cno AND paymentNotification.noti_type = 10
                  LIMIT 1) LIKE '%${searchVal}%'))`),
            ],
          });
        }
        break;
    }

    if (_request.query.area)
      where[Op.and].push(
        models.sequelize.literal(
          `(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1) = '${_request.query.area}' `
        )
      );
    if (_request.query.branch)
      where[Op.and].push({
        '$chargingStationUseLog.org.branch$': _request.query.branch,
      });

    if (_request.query.org)
      where[Op.and].push({
        '$chargingStationUseLog.org.category$': _request.query.org,
      });

    if (_request.query.region)
      where[Op.and].push({
        '$chargingStationUseLog.org.region$': _request.query.region,
      });

    let options = {
      where,
      include: [
        {
          model: models.UsersNew,
          foreignKey: 'usersNewId',
          attributes: { exclude: ['deletedAt'] },
          as: 'userNew',
        },
        {
          model: models.sb_charging_station,
          foreignKey: 'chgs_id',
          attributes: { exclude: ['deletedAt'] },
          as: 'chargingStationUseLog',
          paranoid: false,
          include: [
            {
              model: models.Org,
              foreignKey: 'orgId',
              attributes: { exclude: ['deletedAt'] },
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
        {
          model: models.sb_charger,
          foreignKey: 'chg_id',
          attributes: { exclude: ['deletedAt'] },
          as: 'chargerUseLog',
          paranoid: false,
        },
        {
          model: models.PaymentNotification,
          attributes: { exclude: ['deletedAt'] },
          as: 'paymentNotification',
          // on: {
          //   pg_cno: sequelize.col('paymentNotification.cno'),
          //   '$paymentNotification.noti_type$': 10,
          // },
          require: false,
        },
      ],
      attributes: [
        'cl_id',
        'cl_datetime',
        'cl_kwh',
        'desired_kwh',
        'appliedUnitPrice',
        'cl_unplug_datetime',
        [sequelize.literal('TRUNCATE((cl_kwh - IFNULL(ignored_kwh, 0)) * 0.001, 2)'), 'clCharge'],
        [sequelize.literal('TRUNCATE(IFNULL(ignored_kwh, 0) * 0.001, 2)'), 'clChargeHDO'],
        [sequelize.literal('IFNULL(chargeFee, TRUNCATE(appliedUnitPrice * cl_kwh * 0.001, 0))'), 'totalAmount'],
        [
          models.sequelize.literal(
            '(SELECT card_no FROM PaymentNotifications WHERE cno = paymentNotification.cno AND noti_type = 10 LIMIT 1)'
          ),
          'card_no_noti10',
        ],
        [
          models.sequelize.literal(
            '(SELECT issuer_nm FROM PaymentNotifications WHERE cno = paymentNotification.cno AND noti_type = 10 LIMIT 1)'
          ),
          'issuer_nm_noti10',
        ],
        [
          models.sequelize.literal(
            '(SELECT tran_date FROM PaymentNotifications WHERE cno = paymentNotification.cno AND noti_type = 10 LIMIT 1)'
          ),
          'tran_date_noti10',
        ],
        // [
        //   models.sequelize.literal(
        //     '(SELECT applied_unit_price FROM PaymentNotifications WHERE cno = paymentNotification.cno AND noti_type = 10 LIMIT 1)'
        //   ),
        //   'applied_unit_price_noti10',
        // ],
        // [
        //   models.sequelize.literal(
        //     '(SELECT desired_kwh FROM PaymentNotifications WHERE cno = paymentNotification.cno AND noti_type = 10 LIMIT 1)'
        //   ),
        //   'desired_kwh_noti10',
        // ],
        [
          // models.sequelize.literal(
          //   '(SELECT amount FROM PaymentNotifications WHERE cno = paymentNotification.cno AND noti_type = 10 LIMIT 1)'
          // ),
          // 'amount_noti10',
          models.sequelize.literal(`
            (SELECT 
              (SUM(CASE WHEN pn.noti_type = '10' THEN pn.amount ELSE 0 END) -
              SUM(CASE WHEN pn.noti_type = '20' THEN pn.mgr_amt ELSE 0 END)) AS totalPayment
            FROM 
              PaymentNotifications AS pn  
            WHERE 
              (pn.noti_type = '10' OR pn.noti_type = '20') 
              AND pn.cno = paymentNotification.cno) 
          `),
          'totalPayment',
        ],
        [
          models.sequelize.literal(
            '(SELECT COUNT(id) FROM PaymentNotifications WHERE cno = paymentNotification.cno AND noti_type = 10 LIMIT 1)'
          ),
          'total_noti10',
        ],
        [
          models.sequelize.literal(
            '(SELECT COUNT(id) FROM PaymentNotifications WHERE cno = paymentNotification.cno AND noti_type = 20 LIMIT 1)'
          ),
          'total_noti20',
        ],
        'payCompletedYn',
        'useType',
      ],
    };
    let getQuery;
    let { count: totalCount, rows: chargeHistory } = await models.sb_charging_log.findAndCountAll({
      ...options,
      group: ['sb_charging_log.cl_id'],
      // having: models.sequelize.literal('(total_noti10 >= 0)'), // Use the alias directly in the HAVING clause
      order: [['createdAt', odby]],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
      logging: (query) => {
        console.log('query:::::', query);
        getQuery = query;
      },
    });

    // const totalClCharge = chargeHistory.reduce((accumulator, currentValue) => {
    //   return accumulator + currentValue.dataValues.clCharge;
    // }, 0);

    // const totalClChargeHDO = chargeHistory.reduce((accumulator, currentValue) => {
    //   return accumulator + currentValue.dataValues.clChargeHDO;
    // }, 0);

    const totalCharge = await models.sb_charging_log.findAll({
      ...options,
      attributes: [
        [sequelize.literal('TRUNCATE((cl_kwh - IFNULL(ignored_kwh, 0)) * 0.001, 2)'), 'clCharge'],
        [sequelize.literal('TRUNCATE(IFNULL(ignored_kwh, 0) * 0.001, 2)'), 'clChargeHDO'],
      ],
      group: ['sb_charging_log.cl_id'],
    });

    let { totalClCharge, totalClChargeHDO } = totalCharge.reduce(
      (acc, item) => {
        acc.totalClCharge += item.dataValues.clCharge;
        acc.totalClChargeHDO += item.dataValues.clChargeHDO;
        return acc;
      },
      { totalClCharge: 0, totalClChargeHDO: 0 }
    );

    const chargeHistory2 = [];
    for (let item of chargeHistory) {
      const newItem = { ...item.dataValues };
      chargeHistory2.push({
        ...newItem,
        card_no_noti10: cardNoMask(item.dataValues.card_no_noti10),
      });
    }

    totalClCharge = Number(totalClCharge.toFixed(2));
    totalClChargeHDO = Number(totalClChargeHDO.toFixed(2));

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount: totalCount.length,
      result: chargeHistory2,
      totalClCharge,
      totalClChargeHDO,
      // getQuery,
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
