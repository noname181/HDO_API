

const models = require('../../../models');
const transferNonStandardData = require("../../../util/ocpp/transferNonStandardData");
const moment = require('moment');
const sequelize = require("sequelize");

const sendCurrentUnitPrice = async (chg_id) => {
  const charger = await models.sb_charger.findByPk(chg_id);
  if (charger) {
    const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
    const DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';
    const DIV_CODE_DEFAULT_UNITPRICE = 'DEFAULT_UNITPRICE';

    const [config, config2, config3] = await Promise.all([
      models.Config.findOne({ where: { divCode: DIV_CODE_DEPOSIT } }),
      models.Config.findOne({ where: { divCode: DIV_CODE_MEMBER_DISC } }),
      models.Config.findOne({ where: { divCode: DIV_CODE_DEFAULT_UNITPRICE } }),
    ]);

    const priceSetAll = await models.UnitPriceSet.findAll();
    const data = {
      unitNMPrice: '',
      unitMPrice: '',
      deposit: '',
    };

    data.deposit = parseInt(config.cfgVal) > 0 ? JSON.stringify(parseInt(config.cfgVal)) : JSON.stringify(parseInt(config.cfgVal));

    const memberDiscount = config2.cfgVal;
    const defaultPrice = config3.cfgVal;
    let unitPrice = 0;
    const nowHour = moment().tz('Asia/Seoul').hours();

    if (charger?.usePreset === 'Y') {
      const priceSet = priceSetAll.find(item => item.id === parseInt(charger?.upSetId) || 0);
      unitPrice = priceSet ? (priceSet[`unitPrice${nowHour + 1}`] ? priceSet[`unitPrice${nowHour + 1}`] : defaultPrice) : defaultPrice;
    } else if (charger?.usePreset === 'N') {
      unitPrice = charger.chg_unit_price ?? defaultPrice;
    }

    data.unitNMPrice = unitPrice ? JSON.stringify(unitPrice) : '';
    data.unitMPrice = unitPrice - memberDiscount > 0 ? JSON.stringify(unitPrice - memberDiscount) : '';

    const ocppPendingSendResult = await transferNonStandardData({
      cid: charger?.chg_id,
      vendorId: "com.klinelex",
      messageId: 'sendUnitPrice',
      data: JSON.stringify(data),
    });
    if (ocppPendingSendResult?.result === "000") {
      // 성공시 설정 적용일자를 업데이트 해준다.
      charger.lastConfigAppliedAt = new Date()
      await charger.save()
      return "SEND"
    } else {
      return "SEND_FAIL"
    }
  }
  return "NO_CHARGER"
};

module.exports = sendCurrentUnitPrice;
