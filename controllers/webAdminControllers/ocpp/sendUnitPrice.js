 

const models = require('../../../models'); 
const transferNonStandardData = require("../../../util/ocpp/transferNonStandardData");
const moment = require('moment');
 

const sendUnitPrice = async (array_chg_id = []) => { 
    if(!array_chg_id || array_chg_id.length === 0){
        return false;
    }
      const allChargers = await models.sb_charger.findAll({
        where: {
          chg_id: {
            [models.Sequelize.Op.in]: array_chg_id,
          },
        },
      });
      const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
      const DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';
      const DIV_CODE_DEFAULT_UNITPRICE = 'DEFAULT_UNITPRICE';
  
      const [config, config2, config3] = await Promise.all([
        models.Config.findOne({ where: { divCode: DIV_CODE_DEPOSIT } }),
        models.Config.findOne({ where: { divCode: DIV_CODE_MEMBER_DISC } }),
        models.Config.findOne({ where: { divCode: DIV_CODE_DEFAULT_UNITPRICE } }),
      ]);
  
      const priceSetAll = await models.UnitPriceSet.findAll();

      const res = await Promise.all(allChargers.map(async (charger) => {
       
  
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
      
        const ocppResult = await transferNonStandardData({
          cid: charger.chg_id,
          vendorId: "com.klinelex",
          messageId: 'sendUnitPrice',
          data: JSON.stringify(data),
        });
        if (ocppResult?.result && ocppResult?.result.toString() === '000') {
          charger.lastConfigAppliedAt = new Date();
          await charger.save()
        }
        return {
           cid: charger.chg_id, vendorId: "com.klinelex", messageId: 'sendUnitPrice',  data: JSON.stringify(data), occp: ocppResult  
        };
      }));
      return res;
};

module.exports = sendUnitPrice;
