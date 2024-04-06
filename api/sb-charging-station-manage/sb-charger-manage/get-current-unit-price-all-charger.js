'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { Op } = require('sequelize');
const transferNonStandardData = require('../../../util/ocpp/transferNonStandardData');
const moment = require('moment');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: ['/get-current-unit-price-all-charger'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const allChargers = await models.sb_charger.findAll();

    const priceSetAll = await models.UnitPriceSet.findAll();

    const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
    const DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';
    const DIV_CODE_DEFAULT_UNITPRICE = 'DEFAULT_UNITPRICE';

    const [config, config2, config3] = await Promise.all([
      models.Config.findOne({ where: { divCode: DIV_CODE_DEPOSIT } }),
      models.Config.findOne({ where: { divCode: DIV_CODE_MEMBER_DISC } }),
      models.Config.findOne({ where: { divCode: DIV_CODE_DEFAULT_UNITPRICE } }),
    ]);

    const res = await Promise.all(
      allChargers.map(async (charger) => {
        const data = {
          unitNMPrice: '',
          unitMPrice: '',
          deposit: '',
        };

        data.deposit = parseInt(config.cfgVal) > 0 ? JSON.stringify(parseInt(config.cfgVal)) : '';
        const memberDiscount = config2.cfgVal;
        const defaultPrice = config3.cfgVal;
        let unitPrice = 0;
        const nowHour = moment().tz('Asia/Seoul').hours();

        if (charger?.usePreset === 'Y') {
          const priceSet = priceSetAll.find((item) => item.id === parseInt(charger?.upSetId) || 0);
          unitPrice = priceSet
            ? priceSet[`unitPrice${nowHour + 1}`]
              ? priceSet[`unitPrice${nowHour + 1}`]
              : defaultPrice
            : defaultPrice;
        } else if (charger?.usePreset === 'N') {
          unitPrice = charger.chg_unit_price ?? defaultPrice;
        }

        data.unitNMPrice = unitPrice ? JSON.stringify(unitPrice) : '';
        data.unitMPrice = unitPrice - memberDiscount > 0 ? JSON.stringify(unitPrice - memberDiscount) : '';

        const ocppResult = await transferNonStandardData({
          cid: charger.chg_id,
          vendorId: 'com.klinelex',
          messageId: 'sendUnitPrice',
          data: JSON.stringify(data),
        });

        return {
          cid: charger.chg_id,
          vendorId: 'com.klinelex',
          messageId: 'sendUnitPrice',
          data: JSON.stringify(data),
          occp: ocppResult,
        };
      })
    );

    _response.json({ result: res });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'CHARGER_ID_IS_EXIST') {
    _response.error.badRequest(_error, '해당 chg_charger_id를 가진 충전기가 이미 존재합니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '해당 ID에 대한 충전기 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
