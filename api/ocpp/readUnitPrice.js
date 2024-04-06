'use strict';
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const moment = require('moment');

module.exports = {
  path: '/get_unit_price',
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { body } = request;
  const chgId = body.chg_id ? parseInt(body.chg_id) : 0;

  const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
  const DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';

  const [{ cfgVal: depositVal }, { cfgVal: memberDescVal }, sbCharger] = await Promise.all([
    models.Config.findOne({
      where: {
        divCode: DIV_CODE_DEPOSIT,
      },
    }),
    models.Config.findOne({
      where: {
        divCode: DIV_CODE_MEMBER_DISC,
      },
    }),
    models.sb_charger.findOne({
      where: {
        chg_id: chgId,
      },
    }),
  ]);

  const result = {
    nonmember_price: 0,
    member_price: 0,
    deposit: parseInt(depositVal) || 0,
  };

  if (!sbCharger) {
    return response.status(HTTP_STATUS_CODE.OK).json({ result });
  }

  if (sbCharger.usePreset === 'N') {
    return response.status(HTTP_STATUS_CODE.OK).json({
      result: {
        ...result,
        nonmember_price: sbCharger.chg_unit_price || 0,
        member_price: sbCharger.chg_unit_price ? sbCharger.chg_unit_price - memberDescVal : 0,
      },
    });
  }

  if (sbCharger.usePreset === 'Y') {
    const upSetId = parseInt(sbCharger.upSetId) || 0;
    const priceSet = await models.UnitPriceSet.findOne({
      where: {
        id: upSetId,
      },
    });

    const currentHours = moment().tz('Asia/Seoul').hours() + 1;
    const noMemberPrice = priceSet ? priceSet[`unitPrice${currentHours}`] : 0;

    return response.status(HTTP_STATUS_CODE.OK).json({
      result: {
        ...result,
        nonmember_price: noMemberPrice,
        member_price: noMemberPrice ? noMemberPrice - memberDescVal : 0,
      },
    });
  }

  const DIV_CODE_DEFAULT_PRICE = 'DEFAULT_UNITPRICE';
  const defaultPrice = await models.Config.findOne({
    where: {
      divCode: DIV_CODE_DEFAULT_PRICE,
    },
  });
  return response.status(HTTP_STATUS_CODE.OK).json({
    result: {
      ...result,
      nonmember_price: defaultPrice.cfgVal || 0,
      member_price: defaultPrice.cfgVal ? defaultPrice.cfgVal - memberDescVal : 0,
    },
  });
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}
