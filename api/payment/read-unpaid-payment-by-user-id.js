'use strict';
const { Op } = require('sequelize');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment/unpaid/user'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { id } = _request.user;

  try {

    const unpaidClog = await models.sb_charging_log.findOne({
      where : {
        usersNewId : id,
        payCompletedYn : "N",
        cl_unplug_datetime : { [Op.ne] : null}
      },
      order : [['cl_id', 'DESC']]
    });
    if (unpaidClog) {
      let expectedAmt = unpaidClog?.expectedAmt
      if (!unpaidClog?.expectedAmt) {
        const calculatedAmt = Math.floor(unpaidClog?.appliedUnitPrice * unpaidClog?.cl_kwh * 0.001)
        expectedAmt = calculatedAmt
        // desired_amt가 0보다 클 경우, 희망금액 유형의 충전이라고 보고
        // 희망금액 유형의 충전이라면 그 희망금액보다 큰 금액이 계산되었다면 잘라준다.
        if (unpaidClog?.desired_amt) {
          expectedAmt = calculatedAmt > unpaidClog.desired_amt ? unpaidClog?.desired_amt : calculatedAmt
        }
        unpaidClog.expectedAmt = expectedAmt
        await unpaidClog.save(); // 변경사항을 데이터베이스에 저장
      }
      const returnData = {
        ...unpaidClog.dataValues
      }
      const chgs = await models.sb_charging_station.findByPk(unpaidClog?.chgs_id)
      const charger = await models.sb_charger.findByPk(unpaidClog?.chg_id)
      if (chgs) {
        returnData["chgs_name"] = chgs?.chgs_name
      }
      if (charger) {
        returnData["chg_charger_id"] = charger?.chg_charger_id
      }

      let payFail = await models.sb_charging_pay_fail_log.findOne({
          where: {
            cl_id: unpaidClog?.cl_id
          },
          paranoid: false,
          order : [['cpf_id', 'DESC']]
      }); 

      if(payFail?.createdAt){
        returnData.cl_datetime = payFail.createdAt;
      } 

      _response.status(HTTP_STATUS_CODE.OK).json({
        payments: returnData,
      });
    } else {
      return _response.status(HTTP_STATUS_CODE.OK).json({
        payments: null,
      });
    }
    //
    //
    //
    // _response.json({
    //   totalCount: totalCount,
    //   result: unpaidChargingLogsList
    // })
    //
    //
    //
    // const where = {
    //   [Op.and]: [
    //     { usersNewId: id },
    //     models.sequelize.literal(
    //       `NOT EXISTS (SELECT 1 FROM sb_charging_logs A WHERE A.usersNewId = 307 AND A.payCompletedYn = 'N' AND A.cl_unplug_datetime IS NOT NULL;)`
    //     ),
    //   ],
    // };
    //
    // let paymentIncludeDb = [
    //   {
    //     model: models.sb_charger,
    //     foreignKey: 'chg_id',
    //     paranoid: false,
    //     attributes: { exclude: ['deletedAt'] },
    //     as: 'chargerUseLog',
    //     include: [
    //       {
    //         model: models.ChargerModel,
    //         paranoid: false,
    //         foreignKey: 'chargerModelId',
    //         attributes: { exclude: ['deletedAt'] },
    //         as: 'chargerModel',
    //       },
    //     ],
    //   },
    //   {
    //     model: models.sb_charging_station,
    //     foreignKey: 'chgs_id',
    //     attributes: { exclude: ['deletedAt'] },
    //     as: 'chargingStationUseLog',
    //     paranoid: false,
    //     include: [
    //       {
    //         model: models.Org,
    //         foreignKey: 'orgId',
    //         paranoid: false,
    //         attributes: { exclude: ['deletedAt'] },
    //         as: 'org',
    //       },
    //     ],
    //   },
    // ];
    //
    // const payment = await models.sb_charging_log.findOne({
    //   where,
    //   include: paymentIncludeDb,
    //   order: [['createdAt', 'DESC']],
    // });
    //
    // if (payment) {
    //   const calcPayment = {
    //     ...payment.dataValues,
    //     totalPrice: (payment.dataValues.cl_kwh * 0.001 * payment.dataValues.appliedUnitPrice).toString(),
    //     totalKwh: (payment.dataValues.cl_kwh * 0.001).toString(),
    //   };
    //
    //   return _response.status(HTTP_STATUS_CODE.OK).json({
    //     payments: calcPayment,
    //   });
    // } else {
    //   return _response.status(HTTP_STATUS_CODE.OK).json({
    //     payments: null,
    //   });
    // }
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
