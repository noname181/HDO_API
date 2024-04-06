/**
 * Created by Sarc Bae on 2023-06-07.
 * 충전기 등록 API
 */
'use strict';
const models = require('../../../models');
const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { generateQRCode } = require('../../../util/Qrcode');
const { configuration } = require('../../../config/config');
const sendUnitPrice = require('../../../controllers/webAdminControllers/ocpp/sendUnitPrice');
const { USER_TYPE } = require('../../../util/tokenService');

const DEEPLINK_URL = configuration()?.deeplinkUrl;

module.exports = {
  path: '/chargers-manage',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.updatedAt = new Date(); // updatedAt의 default 값을 sequelize에서 데이터 생성시 호출하지 못하여 수동으로 추가

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.createdWho = userId;
  body.updatedWho = userId;

  // pk는 자동생성이므로, body에 pk가 전달되는 경우 제거
  if (body.chg_id) body.chg_id = undefined;

  if (!body.total_channel) {
    next('EMPTY_TOTAL_CHANNEL');
  }

  try {
    // 해당 chgs_id에 대한 충전소 정보 조회
    const chargingStation = await models.sb_charging_station.findByPk(body.chgs_id, {
      include: [
        {
          model: models.Org,
          as: 'org',
          paranoid: true,
          attributes: [ 
            'category', 
          ],
        }, 
      ],
    });
    if (!chargingStation) throw 'NOT_EXIST_CHARGING_STATION';

    // 1. 1 station can have many chargers, and this chargers can have the same mid

    // 2. 2 station can have many chargers, but 2 different station can not have the same mid

    // 3. ev사업팀 can have many station, and this station can have the same mid

    if (body.mall_id) {
      let chargerWithMallID = await models.sb_charger.findOne({
        include: [ 
          {
            model: models.sb_charging_station,
            as: 'chargingStation',
            paranoid: false,
            attributes: { exclude: ['createdWho', 'updatedWho'] },
            include: [
              {
                model: models.Org,
                as: 'org',
                paranoid: true,
                attributes: [ 
                  'category', 
                ],
              }, 
            ],
          }],
        where: {
          mall_id: body.mall_id,
          chgs_id: {
            [Op.ne]: body.chgs_id,
          },
        },
      });
      if (chargerWithMallID && (chargingStation.dataValues.org.category !== 'EV_DIV' || (chargingStation.dataValues.org.category === 'EV_DIV' && chargingStation.dataValues.org.category !== chargerWithMallID.dataValues.chargingStation.org.category))) { 
        throw 'INVALID_MALL_ID';
      }
    }

    if (body.mall_id2) {
      let chargerWithMallID2 = await models.sb_charger.findOne({
        include: [ 
          {
            model: models.sb_charging_station,
            as: 'chargingStation',
            paranoid: false,
            attributes: { exclude: ['createdWho', 'updatedWho'] },
            include: [
              {
                model: models.Org,
                as: 'org',
                paranoid: true,
                attributes: [ 
                  'category', 
                ],
              }, 
            ],
          }],
        where: {
          mall_id2: body.mall_id2,
          chgs_id: {
            [Op.ne]: body.chgs_id,
          },
        },
      });
      if (chargerWithMallID2 && (chargingStation.dataValues.org.category !== 'EV_DIV' || (chargingStation.dataValues.org.category === 'EV_DIV' && chargingStation.dataValues.org.category !== chargerWithMallID2.dataValues.chargingStation.org.category))) { 
        throw 'INVALID_MALL_ID';
      }
    }

    if (body.chg_alias) {
      let chargerWithChgsAlias = await models.sb_charger.findOne({ where: { chg_alias: body.chg_alias } });
      if (chargerWithChgsAlias) {
        throw 'INVALID_CHGS_ALIAS';
      }
    }

    

    const { count: _totalCount, rows: _chargers } = await models.sb_charger.findAndCountAll({
      where: { chgs_id: body.chgs_id },
      paranoid: false,
      attributes: {
        exclude: ['createdWho', 'updatedWho'],
      },
    });
    const _nextNumber = (await _totalCount) + 1;
    body.chg_charger_id = (await chargingStation.chgs_station_id) + '-' + _nextNumber;

    // 전달된 충전기 정보를 데이터 베이스에 추가
    const charger = await models.sb_charger.create(body);

    //Update Unit price to used
    if (body.upSetId) {
      await models.UnitPriceSet.update(
        { isUsed: true },
        {
          where: {
            id: body.upSetId,
          },
        }
      );
    }

    // 생성된 충전기의 pk로 조회하여 잘 생성되었는지 확인(pk 키 확인 중요!)
    const createdCharger = await models.sb_charger.findByPk(charger.chg_id, {
      include: [
        { model: models.ChargerModel, as: 'chargerModel', attributes: ['modelCode', 'lastFirmwareVer'] },
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });

    const deeplink = DEEPLINK_URL.replace(
      /params={}*/g,
      encodeURIComponent(`chg_id=${createdCharger.chg_id}&chgs_id=${createdCharger.chgs_id}`)
    );

    const dataQr = await generateQRCode(deeplink, 'qrCode.png');

    createdCharger.update({ qrcode: dataQr, deeplink });

    //channel of changer
    if (body.total_channel) {
      const chargerModel = createdCharger.chargerModel?.dataValues;
      for (var i = 1; i <= body.total_channel; i++) {
        let channel_data = {
          chg_id: createdCharger.dataValues.chg_id,
          cs_station_charger_id: createdCharger.chg_charger_id,
          cs_channel: i,
          cs_kwh: 0,
          cs_kwh_cumulative: 0,
          cs_temperature: 0,
          cs_model: chargerModel?.modelCode,
          cs_firmware: chargerModel?.lastFirmwareVer,
        };
        // console.log('channel_data ----->', channel_data)
        await models.sb_charger_state.create(channel_data, {
          attributes: {
            exclude: ['createdWho', 'updatedWho', 'deletedAt'],
          },
        });
      }
    }

    //send unit price to machine (connect ocpp)
    await sendUnitPrice([charger.dataValues.chg_id]);

    // 조회된 결과 반환
    _response.json({
      result: createdCharger,
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
    _response.error.notFound(
      _error,
      '필수 입력 정보가 누락되었습니다.(chgs_id, chargerModelId, chg_unit_price, usePreset)'
    );
    return;
  }

  if (_error === 'NO_REQUIRED_UNIT_PRICE_SET_ID_INPUT') {
    _response.error.notFound(_error, '해당 충전소에 대한 단가테이블id가 누락되었습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGING_STATION') {
    _response.error.notFound(_error, '해당 chgs_id에 대한 충전소가 존재하지 않습니다.');
    return;
  }

  if (_error === 'EMPTY_TOTAL_CHANNEL') {
    _response.error.notFound(_error, '커넥터 수를 선택하세요.');
    return;
  }

  if (_error === 'NOT_EXIST_DEEPLINK_IN_CONFIG') {
    _response.error.notFound(_error, 'config deeplink가 확인되지 않았습니다.');
    return;
  }

  if (_error === 'INVALID_MALL_ID') {
    _response.error.notFound(_error, '이미 다른 충전소에서 해당 MID를 사용하고 있습니다.');
    return;
  }

  if (_error === 'INVALID_CHGS_ALIAS') {
    _response.error.notFound(_error, '이미 입력된 맥어드레스입니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
