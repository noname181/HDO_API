'use strict';
const { Op, QueryTypes, Sequelize } = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { cardNoMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment/outstanding/detail/:cl_id'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {  
  const cl_id = _request.params.cl_id;
  console.log('cl_id:::::::::', cl_id)
  try {
     
    const where = {
        [Op.and]: [
          { cl_id }, 
        ],
      };

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
 
    let result = await models.sb_charging_log.findOne({
        where,
        include,
        attributes: {
            exclude: ['deletedAt', 'userId', 'chgs_id', 'chg_id'],
            include: [
                [models.sequelize.literal('sb_charging_log.cl_kwh * sb_charging_log.appliedUnitPrice'), 'outstandingAmount'],
            ],
        },
        paranoid: false,
    });
    
    let expectedAmt = result.dataValues.expectedAmt;

    if (!expectedAmt) {
      const calculatedAmt = Math.floor(result.dataValues.appliedUnitPrice * result.dataValues.cl_kwh * 0.001);
      expectedAmt = calculatedAmt > result.dataValues.desired_amt ? result.dataValues.desired_amt : calculatedAmt;
    }
  
    result.dataValues.expectedAmt = expectedAmt;

    if (result.dataValues && result.dataValues.cl_kwh) {
        result.dataValues.cl_kwh = formatKwh(result.dataValues.cl_kwh);
    }
    if (result && result.desired_kwh) {
        result.dataValues.desired_kwh = formatKwh(result.dataValues.desired_kwh);
    }
    
    let payFail = await models.sb_charging_pay_fail_log.findOne({
        where,
        paranoid: false,
        order : [['cpf_id', 'DESC']]
    });
     

    let afterActions = await models.sb_charging_pay_fail_after_action.findAll({
        where,
        include: [
            {
                model: models.UsersNew,
                paranoid: false,
                attributes: ['name', 'accountId'],
                as: 'costUser',
            },
            {
                model: models.UsersNew,
                paranoid: false,
                attributes: ['name', 'accountId'],
                as: 'paidUser',
            },
        ],
        paranoid: false,
    });
 
    let combinedResult = result ? result.get({ plain: true }) : {};
     
    combinedResult.payFail = payFail || []; 
    combinedResult.afterActions = afterActions || []; 

    return _response.status(HTTP_STATUS_CODE.OK).json({  
        result: combinedResult,
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
