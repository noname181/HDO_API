/**
 * Created by Sarc Bae on 2023-06-01.
 * 충전소id로 개별 충전소 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { Op, HasMany, QueryTypes, BelongsToMany } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');
// const { USER_TYPE } = require('../../util/tokenService');
const sequelize = require('sequelize');

module.exports = {
  path: '/charging-stations-manage/:chgs_id',
  method: 'get',
  checkToken: true,
  // roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chgs_id = _request.params.chgs_id;
  const type = _request.query.type;
  const sequelizeSelect = models.sequelize;
  const userLocation = {
    latitude: _request.query?.userLat || 0,
    longitude: _request.query?.userLng || 0,
  };

  try {
    // 해당 chgs_id에 대한 충전소 정보 조회
    const userId = _request.user.id || _request.user.sub || 'a';
    const nowHour = moment().tz('Asia/Seoul').hours(); 
    let chargingStation;
    let envChargerId = null;
    let isFavorite = false;
    let coordinate = null;
    let distance = 0;
    let maxKw = 0;
    let favId = chgs_id.toString();
    let maxUnitPriceM = 0
    let minUnitPriceM = 0
    let maxUnitPriceNM = 0
    let minUnitPriceNM = 0
    let memberDisc = 0;  
    
    if (type === 'other') {
      const stationDb = await models.EnvChargeStation.findOne({
        where: {
          statId: chgs_id,
        },
        attributes: [ 
          'id',
          'stat',
          'statNm',
          'statId',
          'chgerType',
          'addr',
          'lat',
          'lng',
          'busiId',
          'bnm',
          'maxOutput',
          'method',
          'parkingFree',
          'limitYn',
          'limitDetail',
          'note', 
          'coordinate',
          'output3',
          'output7',
          'output50',
          'output100', 
          'output200',
           [ 
              models.sequelize.literal(`
              (( 6371 * acos( cos( radians(${userLocation.latitude}) ) * cos( radians( EnvChargeStation.lat ) ) * cos( radians( EnvChargeStation.lng ) - radians(${userLocation.longitude}) ) + sin( radians(${userLocation.latitude}) ) * sin( radians( EnvChargeStation.lat ) ) ) ) * 1000)  
              `), 
              'distance', 
          ],
        ],
        include: [
          {
            model: models.EnvCharger,
            association: new HasMany(models.EnvChargeStation, models.EnvCharger, {
              sourceKey: 'statId',
              foreignKey: 'statId',
              as: 'envChargers',
            }),
            exclude: [''],
          },
        ], 
      });
     
      if (!stationDb) throw 'NOT_EXIST_CHARGING_STATION';

      // 결과 매핑
      const station = stationDb.get({ plain: true });
      //const stationStatus = station.envChargers.find((item) => Number(item.stat) === 2) ? 'ACTIVE' : 'INACTIVE';
      // maxKw = Math.max(...station.envChargers.flatMap((item) => item.output));
      const stationStatus = station.stat === 2 ? 'ACTIVE' : 'INACTIVE';
      if(station.output200){
        maxKw = 200;
      } else if(station.output100){
        maxKw = 100;
      } else if(station.output50){
        maxKw = 50;
      } else if(station.output7){
        maxKw = 7;
      }  else if(station.output3){
        maxKw = 3;
      }
      console.log('station.output200', station.output200)
      console.log('station.output100', station.output100)
      console.log('station.output50', station.output50)
      console.log('station.output7', station.output7)
      console.log('station.output3', station.output3)
      envChargerId = station.id;
      chargingStation = {
        chgs_id: station.statId,
        envChargerId,
        chgs_station_id: station.statId,
        chgs_name: station.statNm,
        chrgStartTime: station.statUpdDt,
        status: stationStatus,
        maxKw,
        pncAvailable: null,
        washStartTime: null,
        washEndTime: null,
        chgs_kepco_meter_no: null,
        isUse: null,
        chgs_car_wash_yn: null,
        chgs_aff_only: null,
        chgs_field_desc: null,
        area_code_id: null,
        chargers: station.envChargers.map((item) => ({
          id: item.id,
          chgsName: item.statNm,
          speedType: checkSpeedType(item.output),
          connectorType: checkConnectorType(item.chgerType),
          address: item.addr,
          maxKw: item.output,
          method: item.method || 'N/A',
          isParkingFree: item.parkingFree,
          isLimite: item.limitYn,
          busiId: item.busiId,
          busiNm: item.bnm,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          stat: Number(item.stat) || 9,
        })), 
      };  
      isFavorite = await models.FavoriteChargerStation.count({
        where: {
          envChargerId: station.statId,
          userId: userId,
        },
      });
      isFavorite = !!isFavorite;
      coordinate = station.coordinate;
      distance = station.distance || 0;
    } else {
      chargingStation = await models.sb_charging_station.findByPk(chgs_id, {
        include: [
          {
            model: models.sb_charger,
            as: 'chargers',
            attributes: { exclude: ['createdWho', 'updatedWho'] },
            paranoid: false,
            include: [
              {
                model: models.sb_charger_state,
                as: 'chargerStates',
                attributes: {
                  exclude: ['cs_charger-state', 'createdWho', 'updatedWho', 'deletedAt'],
                },
                order: [['createdAt', 'DESC']],
              },
              {
                model: models.ChargerModel,
                as: 'chargerModel',
                required: false,
                attributes: 
                  ['id', 'modelCode', 'manufacturerId', 'modelName', 'maxKw',  [
                    models.sequelize.literal(
                      '(SELECT descInfo FROM CodeLookUps WHERE divCode = "SPEED_TYPE" AND descVal = speedType LIMIT 1)'
                    ),
                    'speedType',
                  ],
                  [
                    models.sequelize.literal(
                      '(SELECT descInfo FROM CodeLookUps WHERE divCode = "CON_TYPE" AND descVal = connectorType LIMIT 1)'
                    ),
                    'connectorType',
                  ], 'channelCount', 'lastFirmwareVer', 'pncAvailable', 'useYN', 'createdAt', 'updatedAt'],
                  //exclude: ['deletedAt', 'createdWho', 'updatedWho'],
              },
              {
                model: models.UnitPriceSet,
                as: 'UnitPriceSet',
                attributes: [[`unitPrice${nowHour + 1}`, 'unitPrice']],
              },
            ],
          },
          {
            model: models.Org,
            as: 'org',
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
              'region',
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
          },
          { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
          { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
          { model: models.UsersNew, as: 'operatorManager', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        ],
        attributes: [ 
          'chgs_id',
          'chgs_station_id',
          'status',
          'chgs_name',
          'coordinate',
          'chrgStartTime',
          'chrgEndTime',
          'washStartTime',
          'washEndTime',
          'chgs_kepco_meter_no',
          'isUse',
          'chgs_car_wash_yn',
          'chgs_aff_only',
          'chgs_field_desc',
          'area_code_id', 
          'orgId',
          'chgs_operator_manager_id', 
          'activeStationYN',
          [
            models.sequelize.literal(`
            (( 6371 * acos( cos( radians(${userLocation.latitude}) ) * cos( radians( ST_Y(sb_charging_station.coordinate) ) ) * cos( radians( ST_X(sb_charging_station.coordinate) ) - radians(${userLocation.longitude}) ) + sin( radians(${userLocation.latitude}) ) * sin( radians( ST_Y(sb_charging_station.coordinate) ) ) ) ) * 1000)
            `), 'distance',
          ],  
        ],
      });

      if (!chargingStation) throw 'NOT_EXIST_CHARGING_STATION';
       isFavorite = await models.FavoriteChargerStation.findOne({
        where: {
          chargerId: chargingStation.chgs_id,
          userId: userId,
        },
      });

      let stationStatus = [];
      for (const item of chargingStation.chargers) {
        if (item.chargerStates && item.chargerStates.length > 0) {
          for (const i of item.chargerStates) {
            stationStatus.push(i.cs_charging_state);
          }
        }
      }
      chargingStation.status = [...new Set(stationStatus)].includes('available') ? 'ACTIVE' : 'INACTIVE';

      chargingStation.chargers.forEach((item, index) => {
        const chargersStatus = [];
        if (item.chargerStates && item.chargerStates.length > 0) {
          for (const i of item.chargerStates) {
            chargersStatus.push(i.cs_charging_state);
          }
        }

        chargingStation.chargers[index].status = [...new Set(chargersStatus)].includes('available')
          ? 'ACTIVE'
          : 'INACTIVE';
        
      });
      isFavorite = !!isFavorite;
      coordinate = chargingStation.coordinate;
      distance = chargingStation.dataValues?.distance || 0; 
      maxKw = Math.max(...chargingStation.chargers.flatMap((item) => item?.dataValues?.chargerModel?.maxKw));
    }

    //Get minimum unit price
    let { chargers } = chargingStation;
    let unitPrice;

    if (chargers) {
      chargers = chargers.map((chg) => {
        if (!chg.chg_unit_price) {
          chg.chg_unit_price = chg.UnitPriceSet?.dataValues?.unitPrice;
        }
        return chg;
      });

     
      chargers.sort((a, b) => a.chg_unit_price - b.chg_unit_price);

      const config = await models.Config.findOne({
        where: {
          divCode: 'MEMBER_DISC',
        },
      });
      memberDisc = parseInt(config?.cfgVal);
      maxUnitPriceNM = Math.max(...chargers.map(chg => chg.chg_unit_price));
      maxUnitPriceM = maxUnitPriceNM - memberDisc; 
      minUnitPriceNM = Math.min(...chargers.map(chg => chg.chg_unit_price));
      minUnitPriceM = minUnitPriceNM - memberDisc;  

      unitPrice = getUnitPrice(chargers);
    }

 
    let pncAvailable = false;
    chargingStation.chargers?.map((item) => { 
      if (item?.dataValues?.chargerModel?.pncAvailable) pncAvailable = true;
    });
   
 
    const newObject = {
      coordinate,
      chgs_id: chargingStation.chgs_id,
      favId,
      envChargerId,
      chgs_station_id: chargingStation.chgs_station_id,
      status: chargingStation.status,
      chgs_name: chargingStation.chgs_name,
      chrgStartTime: chargingStation.chrgStartTime,
      chrgEndTime: chargingStation.chrgEndTime,
      washStartTime: chargingStation.washStartTime,
      washEndTime: chargingStation.washEndTime,
      chgs_kepco_meter_no: chargingStation.chgs_kepco_meter_no,
      isUse: chargingStation.isUse,
      chgs_car_wash_yn: chargingStation.chgs_car_wash_yn,
      chgs_aff_only: chargingStation.chgs_aff_only,
      chgs_field_desc: chargingStation.chgs_field_desc,
      area_code_id: chargingStation.area_code_id,
      createdAt: chargingStation.createdAt,
      updatedAt: chargingStation.updatedAt,
      orgId: chargingStation.orgId,
      chgs_operator_manager_id: chargingStation.chgs_operator_manager_id,
      chargers: chargingStation.chargers,
      org: chargingStation.org,
      createdBy: chargingStation.createdBy,
      updatedBy: chargingStation.updatedBy,
      operatorManager: chargingStation.operatorManager,
      isFavorite,
      unitPrice: unitPrice,
      activeStationYN: chargingStation.activeStationYN,
      maxKw,
      pncAvailable,
      limitYn: chargingStation.limitYn ? chargingStation.limitYn : 'Y',
      parkings: chargingStation.parkingFree ? chargingStation.parkingFree : 'Y',
      region: chargingStation.region,
      distance,
      maxUnitPriceM,
      minUnitPriceM,
      maxUnitPriceNM,
      minUnitPriceNM,
    }; 
    // 조회된 사용자 정보 응답
    _response.json({
      result: newObject,
    });
  } catch (e) {
    next(e);
  }
}
function getUnitPrice(chargers) {
  const validCharger = chargers.find((chg) => chg.chg_unit_price);
  return validCharger ? validCharger.chg_unit_price : null;
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CHARGING_STATION') {
    _response.error.notFound(_error, '해당 ID에 대한 충전소가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

function checkSpeedType(val){
  if(val == 3 || val == 7){
    return '완속';
  } else if(val == 50){
    return '50kW';
  } else if(val == 100){
    return '100kW';
  } else if(val == 200){
    return '200kW';
  }
  return '';
}

function checkConnectorType(val){
  let arrConnectorType = [];
  if(val == 2){
    arrConnectorType.push('완속');
  } 
  if([4,5,6].includes(val)){
    arrConnectorType.push('DC콤보'); 
  } 
  if([1,3,5,6].includes(val)){ 
    arrConnectorType.push('차데모'); 
  } 
  if([7,3,6].includes(val)){
    arrConnectorType.push('AC3상');  
  }
  return arrConnectorType.map(String).join("+");
}
