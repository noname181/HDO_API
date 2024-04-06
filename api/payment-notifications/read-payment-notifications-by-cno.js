'use strict';
const { Op } = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment-notifications'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read, PERMISSIONS.list],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  let { cno, cl_id } = _request.query;
  const odby = _request.query.odby ? _request.query.odby.toUpperCase() : 'ASC';

  try {
    if (!cno && !cl_id) throw 'NO_REQUIRED_INPUT';
    let result = [];
    let totalCount = 0;
    // PAYMENT SUCCESS
    if (cno) {
      let { count: count, rows: paymentsData } = await models.PaymentNotification.findAndCountAll({
        attributes: {
          include: [
            [
              models.sequelize.fn(
                'IFNULL',
                models.sequelize.literal(`(
                  SELECT receivePhoneNo
                  FROM sb_charging_logs
                  WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
                )`),
                models.sequelize.literal(`(
                  SELECT phone
                  FROM sb_charge_local_ic_pays
                  WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
                )`)
              ),
              'phoneNoNewVersion',
            ],
            [
              models.sequelize.literal(`(
                SELECT receivePhoneNo
                FROM sb_charging_logs
                WHERE pg_cno = PaymentNotification.cno AND PaymentNotification.noti_type = 10
              )`),
              'phoneNoOldVersion',
            ],
          ],
        },
        where: {
          cno,
        },
        include: [
          {
            model: models.sb_charger,
            attributes: { exclude: ['deletedAt'] },
            as: 'sb_charger_memb',
            paranoise: true,
            include: [
              {
                model: models.sb_charging_station,
                foreignKey: 'chgs_id',
                paranoid: false,
                attributes: { exclude: ['deletedAt'] },
                as: 'chargingStation',
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
                    ],
                    as: 'org',
                  },
                ],
              },
            ],
          },
          {
            model: models.RequestRefund,
            as: 'requestRefunds',
            attributes: ['div_code', 'refund_reason', 'oriPgCno', 'cancelPgCno', 'cancelAmount'],
            include: [
              {
                model: models.UsersNew,
                foreignKey: 'userId',
                paranoid: false,
                attributes: ['name', 'accountId'],
                as: 'whoRefund',
              },
            ],
          },
        ],
        order: [['createdAt', odby]],
      });
      console.log('totalCount::::::', totalCount);
      totalCount = count;
      result = paymentsData;
    }

    // PAYMENT FAIL
    if (cl_id) {
      const where = {
        [Op.and]: [{ cl_id }],
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

      let resultCharging = await models.sb_charging_log.findOne({
        where,
        include,
        attributes: {
          exclude: ['deletedAt', 'userId', 'chgs_id', 'chg_id'],
          include: [
            [
              models.sequelize.literal('sb_charging_log.cl_kwh * sb_charging_log.appliedUnitPrice'),
              'outstandingAmount',
            ],
          ],
        },
        paranoid: false,
      });

      let expectedAmt = resultCharging.dataValues.expectedAmt;

      if (!expectedAmt) {
        const calculatedAmt = Math.floor(
          resultCharging.dataValues.appliedUnitPrice * resultCharging.dataValues.cl_kwh * 0.001
        );
        expectedAmt =
          calculatedAmt > resultCharging.dataValues.desired_amt ? resultCharging.dataValues.desired_amt : calculatedAmt;
      }

      resultCharging.dataValues.expectedAmt = expectedAmt;

      if (resultCharging.dataValues && resultCharging.dataValues.cl_kwh) {
        resultCharging.dataValues.cl_kwh = formatKwh(resultCharging.dataValues.cl_kwh);
      }
      if (resultCharging && resultCharging.desired_kwh) {
        resultCharging.dataValues.desired_kwh = formatKwh(resultCharging.dataValues.desired_kwh);
      }

      let payFail = await models.sb_charging_pay_fail_log.findOne({
        where,
        paranoid: false,
        order: [['cpf_id', 'DESC']],
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

      let combinedResult = resultCharging ? resultCharging.get({ plain: true }) : {};

      combinedResult.payFail = payFail || [];
      combinedResult.afterActions = afterActions || [];
      result = combinedResult;
    }

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount,
      result,
      cno,
      cl_id,
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

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(cno)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

function formatKwh(num) {
  if (!num) {
    return '';
  }
  return parseFloat(num / 1000).toFixed(2);
}
