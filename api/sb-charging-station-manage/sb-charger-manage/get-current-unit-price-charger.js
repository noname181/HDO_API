'use strict';
let models = require('../../../models');
let { USER_ROLE } = require('../../../middleware/role.middleware');
let { Op } = require('sequelize');
let transferNonStandardData = require('../../../util/ocpp/transferNonStandardData');
let moment = require('moment');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: ['/get-current-unit-price-charger/:chg_id'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  let chg_id = _request.params.chg_id;

  let body = await _request.body; // 수정될 충전기 정보
  if (body.chg_id) body.chg_id = undefined; // body에 id가 있으면 제거

  let ocpp_return = '';

  try {
    // if (body.chg_charger_id) {
    //   let existCheck = await models.sb_charger.findOne({
    //     where: {
    //       chg_id: { [Op.ne]: chg_id },
    //       chg_charger_id: body.chg_charger_id,
    //     },
    //     transaction: transaction,
    //     attributes: {
    //       exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    //     },
    //   });
    //   if (existCheck) throw 'CHARGER_ID_IS_EXIST';
    // }

    // 해당 chg_id에 대한 충전기 정보 조회
    let charger = await models.sb_charger.findByPk(chg_id, {
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });
    if (!charger) throw 'NOT_EXIST_CHARGER';

    let DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
    let DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';

    let data = {
      unitNMPrice: 0,
      unitMPrice: 0,
      deposit: 0,
    };

    let config = await models.Config.findOne({
      where: {
        divCode: DIV_CODE_DEPOSIT,
      },
    });

    let config2 = await models.Config.findOne({
      where: {
        divCode: DIV_CODE_MEMBER_DISC,
      },
    });

    data.deposit = parseInt(config.cfgVal);

    let memberDiscount = config2.cfgVal;

    let unitPrice = 0;

    let nowHour = moment().tz('Asia/Seoul').hours();

    if (charger.usePreset == 'Y') {
      let priceSet = await models.UnitPriceSet.findOne({
        where: {
          id: charger.upSetId,
        },
      });
      unitPrice = priceSet[`unitPrice${nowHour + 1}`];
    } else if (charger.usePreset == 'N') {
      unitPrice = charger.chg_unit_price;
    }

    data.unitNMPrice = unitPrice;

    data.unitMPrice = unitPrice - memberDiscount;

    let ocppResult = await transferNonStandardData({
      cid: chg_id,
      vendorId: 'com.klinelex',
      messageId: 'sendUnitPrice',
      data,
    });

    // 수정된 정보 응답
    _response.json({
      result: { cid: chg_id, vendorId: 'com.klinelex', messageId: 'sendUnitPrice', data, ocpp: ocppResult },
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  //   console.error(_error);

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
