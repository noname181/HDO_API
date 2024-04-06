'use strict';
const { Op, QueryTypes, Sequelize } = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { cardNoMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment/outstanding'],
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
      ACCOUNT_ID: 'accountId',
      USERNAME: 'user_name',
      RECEIVE_PHONE: 'receivePhoneNo',
    };
 
    const where = {
      [Op.and]: [
        { cl_unplug_datetime: { [Op.not]: null } },
        {
          [Op.or]: [
            {
              [Op.and]: [{ payCompletedYn: 'N' }, { useType: { [Op.not]: 'CREDIT' } }],
            },
            { afterAction: { [Op.or]: ['COST', 'PAID'] } },
          ],
        },
        { '$userNew.accountId$': { [Op.not]: null, } },
      ],
    };

    if (startDate || endDate) {
      if (startDate && endDate) {
        where[Op.and].push({ createdAt: { [Op.between]: [startDate, endDate] } });
      } else if (startDate) {
        where[Op.and].push({ createdAt: { [Op.gte]: startDate } });
      } else if (endDate) {
        where[Op.and].push({ createdAt: { [Op.lte]: endDate } });
      }
    }

    let include = [
      // {
      //   model: models.PaymentNotification,
      //   paranoid: false,
      //   attributes: { exclude: ['desired_kwh', 'deletedAt'] },
      //   as: 'paymentNotification',
      // },
      {
        model: models.UsersNew,
        foreignKey: 'usersNewId',
        paranoid: false,
        attributes: { exclude: ['deletedAt'] },
        as: 'userNew',
      },
      {
        model: models.sb_charger,
        paranoid: false,
        attributes: { exclude: ['deletedAt'] },
        as: 'chargerUseLog',
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
                      `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'AREA' AND descVal = area LIMIT 1)`
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
        where[Op.and].push({
          '$chargerUseLog.chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.CHG_STATION_NAME:
        where[Op.and].push({
          '$chargerUseLog.chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.ACCOUNT_ID:
        where[Op.and].push({
          '$userNew.accountId$': searchVal,
        });
        break;
      case SEARCH_KEY.USERNAME:
        where[Op.and].push({
          '$userNew.name$': searchVal,
        });
        break;
      case SEARCH_KEY.RECEIVE_PHONE:
        where[Op.and].push({
          receivePhoneNo: { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      default:
        if (searchVal) {
          where[Op.and].push({
            [Op.or]: [
              { '$chargerUseLog.chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } },
              { '$chargerUseLog.chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$chargerUseLog.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$userNew.accountId$': searchVal },
              { '$userNew.name$': searchVal },
              { receivePhoneNo: { [Op.like]: '%' + searchVal + '%' } },
            ],
          });
        }
        break;
    }

    const { count: totalCount, rows: result } = await models.sb_charging_log.findAndCountAll({
      where,
      include,
      attributes: {
        exclude: ['deletedAt', 'userId', 'chgs_id', 'chg_id'],
      },
      order: [['createdAt', odby]],
      paranoid: false,
    }); 

    let payments = [];
    let totalNotPaid = 0;
    let totalCost = 0;
    for (let item of result) {
      if (item.dataValues.cl_kwh) item.dataValues.cl_kwh = formatKwh(item.dataValues.cl_kwh);
      if (item.dataValues.desired_kwh) item.dataValues.desired_kwh = formatKwh(item.dataValues.desired_kwh);

      let expectedAmt = item.dataValues.expectedAmt;
      if (!expectedAmt) {
        const calculatedAmt = Math.floor(item.dataValues.appliedUnitPrice * item.dataValues.cl_kwh * 0.001)
        expectedAmt = calculatedAmt > item.dataValues.desired_amt ? item.dataValues.desired_amt : calculatedAmt;
      }

      item.dataValues.expectedAmt = expectedAmt;

      if(item.dataValues.payCompletedYn === 'N'){
        totalNotPaid += item.dataValues.expectedAmt;
      }

      if(item.dataValues.afterAction === 'COST'){
        totalCost += item.dataValues.expectedAmt;
      } 

      const newItem = { ...item.dataValues };
      payments.push({
        ...newItem,
      });
    }

    const startIndex = (pageNum - 1) * rowPerPage;
    const endIndex = startIndex + rowPerPage; 
    payments = payments.slice(startIndex, endIndex);

    const totalKwh = await models.sb_charging_log.findOne({
      where,
      include,
      attributes: [
        [
          models.sequelize.fn(
            'ROUND',
            models.sequelize.fn('SUM', models.sequelize.literal('sb_charging_log.cl_kwh / 1000')),
            2
          ),
          'totalClKwh',
        ],
        // [
        //   models.sequelize.fn(
        //     'ROUND',
        //     models.sequelize.fn(
        //       'SUM',
        //       models.sequelize.literal('sb_charging_log.cl_kwh * sb_charging_log.appliedUnitPrice')
        //     )
        //   ),
        //   'totalOutstandingAmount',
        // ],
      ],
    });

    // const totalKwhAfterActionCost = await models.sb_charging_log.findOne({
    //   where: {
    //     ...where,
    //     afterAction: 'COST',
    //   },
    //   include,
    //   attributes: [
    //     [
    //       models.sequelize.fn(
    //         'ROUND',
    //         models.sequelize.fn('SUM', models.sequelize.literal('sb_charging_log.cl_kwh / 1000')),
    //         2
    //       ),
    //       'totalClKwh',
    //     ],
    //     [
    //       models.sequelize.fn(
    //         'ROUND',
    //         models.sequelize.fn(
    //           'SUM',
    //           models.sequelize.literal('sb_charging_log.cl_kwh * sb_charging_log.appliedUnitPrice')
    //         )
    //       ),
    //       'totalOutstandingAmount',
    //     ],
    //   ],
    // });

    // const totalKwhAfterActionPaid = await models.sb_charging_log.findOne({
    //   where: {
    //     ...where,
    //     afterAction: 'PAID',
    //   },
    //   include,
    //   attributes: [
    //     [
    //       models.sequelize.fn(
    //         'ROUND',
    //         models.sequelize.fn('SUM', models.sequelize.literal('sb_charging_log.cl_kwh / 1000')),
    //         2
    //       ),
    //       'totalClKwh',
    //     ],
    //     [
    //       models.sequelize.fn(
    //         'ROUND',
    //         models.sequelize.fn(
    //           'SUM',
    //           models.sequelize.literal('sb_charging_log.cl_kwh * sb_charging_log.appliedUnitPrice')
    //         )
    //       ),
    //       'totalOutstandingAmount',
    //     ],
    //   ],
    // });
 
    
   


    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalNotPaid,
      totalCost,
      totalCount,
      totalClKwh: totalKwh?.dataValues?.totalClKwh?.toFixed(2) || 0,
      // totalOutstandingAmount: totalKwh?.dataValues?.totalOutstandingAmount || 0,
      result: payments,
      // totalAfterActionCost: {
      //   totalKwh: totalKwhAfterActionCost?.dataValues?.totalClKwh?.toFixed(2) || 0,
      //   totalAmount: totalKwhAfterActionCost?.dataValues?.totalOutstandingAmount || 0,
      // },
      // totalAfterActionPaid: {
      //   totalKwh: totalKwhAfterActionPaid?.dataValues?.totalClKwh?.toFixed(2) || 0,
      //   totalAmount: totalKwhAfterActionPaid?.dataValues?.totalOutstandingAmount || 0,
      // },
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
