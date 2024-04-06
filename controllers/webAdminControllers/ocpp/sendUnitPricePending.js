

const models = require('../../../models');
const transferNonStandardData = require("../../../util/ocpp/transferNonStandardData");
const moment = require('moment');
const sequelize = require("sequelize");

/**
 * @typedef {Object} PendingUnitPrice
 * @property {bigint} ucp_id - 단가변경예약 인덱스
 * @property {bigint} chg_id - 충전기 아이디
 * @property {string} usePreset - 단가프리셋 사용여부
 * @property {number} upSetId - 단가프리셋 사용시 단가프리셋 아이디
 * @property {number} chg_unit_price - 단가프리셋 미사용시 고정단가
 * @property {number} ucp_insert_dt - 등록일(날짜검색용, 인덱스)
 * @property {string} result - 처리결과
 */

const sendUnitPricePending = async (pendingUnitPrice) => {
  const charger = await models.sb_charger.findByPk(pendingUnitPrice?.chg_id);
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

    if (pendingUnitPrice?.usePreset === 'Y') {
      const priceSet = priceSetAll.find(item => item.id === parseInt(pendingUnitPrice?.upSetId) || 0);
      unitPrice = priceSet ? (priceSet[`unitPrice${nowHour + 1}`] ? priceSet[`unitPrice${nowHour + 1}`] : defaultPrice) : defaultPrice;
    } else if (pendingUnitPrice?.usePreset === 'N') {
      unitPrice = pendingUnitPrice.chg_unit_price ?? defaultPrice;
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
      // 성공시 이 대기건 이전 시간대의 모든 Pending을 처리완료로 바꿔줌.
      const processingSent = await models.sequelize.query(
          `UPDATE
               sb_unitprice_change_pendings
               SET
               isSent = true
               WHERE chg_id = :chg_id
               and ucp_id <= :ucp_id
               `,
          {
            replacements: { ucp_id: pendingUnitPrice?.ucp_id, chg_id: pendingUnitPrice?.chg_id },
            type: sequelize.QueryTypes.UPDATE
          }
      );

      // 또한 아직 변경되지 않았던 기존 충전기의 단가 정보를 변경해줌.
      charger.usePreset = pendingUnitPrice?.usePreset
      if (pendingUnitPrice?.usePreset === "Y" && pendingUnitPrice?.upSetId) {
        charger.upSetId = pendingUnitPrice?.upSetId
      } else if (pendingUnitPrice?.usePreset === "N" && pendingUnitPrice?.chg_unit_price) {
        charger.chg_unit_price = pendingUnitPrice?.chg_unit_price
      }
      // 단가전송에 성공했으므로 마지막 설정업데이트 컬럼을 현재시간으로 업데이트 해준다.
      charger.lastConfigAppliedAt = new Date()
      await charger.save()
      return "SEND"
    } else {
      return "SEND_FAIL"
    }
  }
  return "NO_CHARGER"
};

module.exports = sendUnitPricePending;
