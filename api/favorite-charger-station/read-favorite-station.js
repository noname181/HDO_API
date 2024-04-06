/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { Op, HasMany } = require('sequelize');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/favorite-station'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
    const sort = _request.query?.sort;
    const userLocation = {
      latitude: _request.query?.userLat || 0,
      longitude: _request.query?.userLng || 0,
    };
 
 
    let where = {
      deletedAt: null,
      [Op.not]: {
        [Op.and]: {
          chargerId: null,
          envChargerId: null,
        },
      },
    };
    if (where[Op.and] === undefined) where[Op.and] = [];
    if (userId) {
      where[Op.and].push({ userId: { [Op.like]: '%' + userId + '%' } });
    }
    let options = {
      where: where,
      include: [
        {
          model: models.UsersNew,
          as: 'user',
          attributes: ['id', 'accountId', 'type', 'role', 'name', 'email', 'phoneNo'],
        },
        {
          model: models.EnvChargeStation,
          as: 'envCharger',
          required: false,
          include: [
            {
              model: models.EnvCharger,
              association: new HasMany(models.EnvChargeStation, models.EnvCharger, {
                sourceKey: 'statId',
                foreignKey: 'statId',
                as: 'envChargers',
              }),
            },
          ],
         
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
                (( 6371 * acos( cos( radians(${userLocation.latitude}) ) * cos( radians( envCharger.lat ) ) * cos( radians( envCharger.lng ) - radians(${userLocation.longitude}) ) + sin( radians(${userLocation.latitude}) ) * sin( radians( envCharger.lat ) ) ) ) * 1000)  
                `), 
                'distance', 
            ],
          ],
        },
        {
          model: models.sb_charging_station,
          as: 'charger',
          where: {
            deletedAt: null,
          },
          required: false,
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
              (( 6371 * acos( cos( radians(${userLocation.latitude}) ) * cos( radians( ST_Y(charger.coordinate) ) ) * cos( radians( ST_X(charger.coordinate) ) - radians(${userLocation.longitude}) ) + sin( radians(${userLocation.latitude}) ) * sin( radians( ST_Y(charger.coordinate) ) ) ) ) * 1000)
              `), 'distance',
            ],  
          ],
          include: [
            {
              model: models.sb_charger,
              as: 'chargers',
              attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
              include: [
                {
                  model: models.sb_charger_state,
                  as: 'chargerStates',
                  attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
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
              ],
            },
            {
              model: models.Org,
              as: 'org',
              attributes: ['id', 'category', 'name', 'fullname', 'address', 'branch', 'area', 'closed', 'erp'],
            },
          ],
        },
      ],
      order: [['sortNumber', 'ASC']],
      logging: console.log,
    };

    let stations = await models.FavoriteChargerStation.findAll(options);
    let stations_ = stations
      .map((item) => {
        const value = item.get({ plain: true });
        let maxKw = 0;
        let pncAvailable = false;

        let sbStation = null;
        if (value.charger) {
          const stationStatus = value.charger.chargers
            .map((item) => item.chargerStates)
            .flat(1)
            .map((item) => item.cs_charging_state);

          sbStation = {
            ...value.charger,
            status: [...new Set(stationStatus)].includes('available') ? 'ACTIVE' : 'INACTIVE',
          };
        }

        let envStation = null;
        if (value.envCharger) {
          // const stationStatus = value.envCharger.envChargers.map((item) => Number(item.stat));
          // maxKw = Math.max(...value.envCharger.envChargers.flatMap((item) => item.output));
          if(value.envCharger.output200){
            maxKw = 200;
          } else if(value.envCharger.output100){
            maxKw = 100;
          } else if(value.envCharger.output50){
            maxKw = 50;
          } else if(value.envCharger.output7){
            maxKw = 7;
          }  else if(value.envCharger.output3){
            maxKw = 3;
          }
          envStation = {
            ...value.envCharger,
            envChargers: value.envCharger?.envChargers,
            status: value.envCharger.stat === 2 ? 'ACTIVE' : 'INACTIVE',
          };
        }
        if(value.charger) {
          maxKw = Math.max(...value.charger.chargers.flatMap((item) => item.chargerModel.maxKw));
        }
        if (!value.envCharger && !value.charger) {
          return;
        }
       
        value.charger?.chargers?.map((item) => { 
          if (item.chargerModel?.pncAvailable) {
            pncAvailable = true;
          }
        });
        var distance = (sbStation ? sbStation.distance : 0) || (envStation ? envStation.distance : 0)

        if(sbStation && sbStation.distance)
        delete sbStation.distance;

        if(envStation && envStation.distance)
        delete envStation.distance; 
        return {
          ...value,
          favId: envStation?.statId || sbStation?.chgs_id?.toString(),
          charger: sbStation,
          envCharger: envStation, 
          maxKw,
          pncAvailable,
          distance,
        };
      })
      .filter((item) => !!item);

      
      if(sort === 'distance'){
        stations_ = stations_.sort((a, b) => a?.distance - b?.distance);
      }
      

    _response.json({ result: stations_, totalCount: stations.length });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
