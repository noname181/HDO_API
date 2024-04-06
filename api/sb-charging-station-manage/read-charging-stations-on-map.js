'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
const { USER_TYPE } = require('../../util/tokenService');
const countBy = require('lodash/countBy');
const maxBy = require('lodash/maxBy');
const entries = require('lodash/entries');

module.exports = {
  path: ['/charging-stations-on-map'],
  method: 'get',
  checkToken: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  let stationTemplate = {
    chgs_id: 0,
    chgs_station_id: null,
    status: null,
    chgs_name: null,
    coordinate: null,
    limits: null,
    busiId: null,
    chargers: [
      {
        chg_id: 0,
        chgs_id: null,
        status: null,
        charger_status: null,
        chg_unit_price: 0,
        chargerStates: [
          {
            cs_charging_state: null,
          },
        ],
        chargerModel: {
          maxKw: 0,
          connectorType: null,
        },
        UnitPriceSet: 0,
      },
    ],
    org: {
      address: null,
    },
    createdBy: null,
    updatedBy: {
      id: null,
      accountId: null,
      name: null,
      status: null,
      orgId: null,
    },
    operatorManager: null,
  };

  try {
    const userId = _request?.user?.id || _request?.user?.sub || null; // API 호출자의 user id
    // 충전 용량
    // str.replace(/\[|\]/g, '')

    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    // 충전기 상태
    const chargerStatus = _request.query.chargerStatus ? _request.query.chargerStatus.toUpperCase() : null;
    // 충전소 상태 -- 환경부에는 없음
    const status = 'ACTIVE';

    const statusENV = _request.query.status ? 2 : null;

    // 충전소 이름
    const name = _request.query.name || null;
    // 충전소 주소
    const address = _request.query.address || null;
    // 제한
    const limits = _request.query.limits || null;

    // 충전 가능 여부
    const isUse = _request.query.isUse || null;
    const onlyStation = _request.query?.onlyStation ? _request.query.onlyStation == 'true' : true;
    // 사업자 ID
    const { body } = _request;

    const mapCenterLocation = {
      latitude: _request.query?.lat || 0,
      longitude: _request.query?.lng || 0,
    };

    const userLocation = {
      latitude: _request.query?.userLat || 0,
      longitude: _request.query?.userLng || 0,
    };

    const { busiId, connectorType, speed } = body;
    // const busiId = _request.query.busiId ? _request.query.busiId.replace(/\[|\]/g, '') : null;
    // 충전 타입
    // const connectorType = _request.query.connectorType ? _request.query.connectorType.replace(/\[|\]/g, '') : null;
    // const speed = _request.query.speed ? _request.query.speed.replace(/\[|\]/g, '') : null;

    const nowHour = moment().tz('Asia/Seoul').hours();

    let otherStationWithChargers = [];

    if (onlyStation) {
      const otherStationQuery = [];
      if (speed) {
        otherStationQuery.push({ '$envChargers.output$': { [Op.in]: speed } });
      }

      if (statusENV) {
        otherStationQuery.push({ '$envChargers.stat$': statusENV });
      }

      if (name) {
        otherStationQuery.push({ '$EnvChargeStation.statNm$': { [Op.like]: '%' + name + '%' } });
      }

      if (address) {
        otherStationQuery.push({ '$EnvChargeStation.addr$': { [Op.like]: '%' + address + '%' } });
      }

      if (limits) {
        otherStationQuery.push({ '$EnvChargeStation.limitYn$': limits });
      }

      if (connectorType) {
        otherStationQuery.push({ '$EnvChargeStation.chgerType$': { [Op.in]: connectorType } });
      }

      if (busiId) {
        otherStationQuery.push({ '$envChargers.busiId$': { [Op.in]: busiId } });
      }

      // if (isUse) {
      //   if (isUse === 'available') {
      //     replacements.isUse = 2;
      //     whereConditions.push(' charger.stat = :isUse ');
      //   } else {
      //     replacements.isUse = isUse;
      //     whereConditions.push(' charger.stat != :isUse ');
      //   }
      // }

      const otherStation = await models.EnvChargeStation.findAll({
        where: {
          [Op.and]: otherStationQuery,
        },
        include: [
          {
            model: models.EnvCharger,
            association: new sequelize.HasMany(models.EnvChargeStation, models.EnvCharger, {
              sourceKey: 'statId',
              foreignKey: 'statId',
              as: 'envChargers',
            }),
          },
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`
              (( 6371 * acos( cos( radians(${userLocation.latitude}) ) * cos( radians( EnvChargeStation.lat ) ) * cos( radians( EnvChargeStation.lng ) - radians(${userLocation.longitude}) ) + sin( radians(${userLocation.latitude}) ) * sin( radians( EnvChargeStation.lat ) ) ) ) * 1000)
              `),
              'distance',
            ],
            [
              sequelize.literal(`
              (( 6371 * acos( cos( radians(${mapCenterLocation.latitude}) ) * cos( radians( EnvChargeStation.lat ) ) * cos( radians( EnvChargeStation.lng ) - radians(${mapCenterLocation.longitude}) ) + sin( radians(${mapCenterLocation.latitude}) ) * sin( radians( EnvChargeStation.lat ) ) ) ) * 1000)
              `),
              'distanceFromMapCenter',
            ],
          ],
          exclude: ['createdWho', 'updatedWho', 'deletedAt'],
        },
        limit: 50,
        group: ['EnvChargeStation.statId'],
        order: [['distanceFromMapCenter']],
        subQuery: false,
      });

      otherStationWithChargers = otherStation.map((station) => {
        const stationStatus = [];
        station.dataValues.envChargers.forEach((item) => {
          if (item.stat) {
            stationStatus.push(Number(item.stat));
          }
        });

        const countMostFrequencyBusiId = countBy(station.dataValues.envChargers, 'busiId');
        const mostFrequencyBusiId = maxBy(entries(countMostFrequencyBusiId), (entry) => entry[1]);

        return {
          chgs_id: 0,
          envChargerId: station.dataValues.id,
          chgs_station_id: station.dataValues.statId,
          status: stationStatus.includes(2) ? 'ACTIVE' : 'INACTIVE',
          chgs_name: station.dataValues.statNm,
          coordinate: station.dataValues.coordinate,
          limits: station.dataValues.limitYn,
          busiId: mostFrequencyBusiId[0] || null,
          distance: station.dataValues.distance,
          distanceFromMapCenter: station.dataValues.distanceFromMapCenter,
          chargers:
            station.dataValues.envChargers && station.dataValues.envChargers.length > 0
              ? [
                  {
                    chg_id: 0,
                    chgs_id: station.dataValues.envChargers[0].chgerId,
                    status:
                      station.dataValues.envChargers[0].stat && Number(station.dataValues.envChargers[0].stat) === 2
                        ? 'ACTIVE'
                        : 'INACTIVE',
                    charger_status: station.dataValues.envChargers[0].stat,
                    chg_unit_price: 0,
                    chargerStates: [
                      {
                        cs_charging_state:
                          station.dataValues.envChargers[0].stat && Number(station.dataValues.envChargers[0].stat) === 2
                            ? 'available'
                            : 'else',
                      },
                    ],
                    chargerModel: {
                      maxKw: parseInt(station.dataValues.chargerOutput),
                      connectorType: station.dataValues.chargerType,
                    },
                    UnitPriceSet: 0,
                  },
                ]
              : [],
          org: {
            address: station.dataValues.addr,
          },
          createdBy: null,
          updatedBy: null,
          operatorManager: null,
        };
      });
    }

    let where = {};

    if (where[Op.and] === undefined) where[Op.and] = [];

    if (speed) {
      where[Op.and].push({
        '$chargers.chargerModel.maxKw$': { [Op.in]: speed },
      });
    }

    where[Op.and].push({
      coordinate: { [Op.ne]: null },
    });

    if (chargerStatus) {
      where[Op.and].push({
        '$chargers.status$': { [Op.eq]: chargerStatus },
      });
    }
    if (status) {
      where[Op.and].push({
        status: { [Op.eq]: status },
      });
    }

    if (connectorType) {
      where[Op.and].push({ '$chargers.chargerModel.connectorType$': connectorType });
    }

    if (isUse) {
      if (isUse === 'available') {
        where[Op.and].push({ '$chargers.chargerStates.cs_charging_state$': 2 });
      } else {
        where[Op.and].push({ '$chargers.chargerStates.cs_charging_state$': { [Op.ne]: 2 } });
      }
    }

    if (name) {
      where[Op.and].push({
        [Op.or]: [
          {
            [Op.and]: [
              { '$org.name$': { [Op.like]: '%' + name + '%' } },
              {
                '$org.category$': { [Op.ne]: 'EV_DIV' },
              },
            ],
          },
          {
            [Op.and]: [
              { $chgs_name$: { [Op.like]: '%' + name + '%' } },
              {
                '$org.category$': 'EV_DIV',
              },
            ],
          },
        ],
      });
    }
    if (address) {
      where[Op.and].push({ '$org.address$': { [Op.like]: '%' + address + '%' } });
    }
    // if (_request.query.lat && _request.query.lng && !name && !address) {
    //   where[Op.and].push(
    //     models.sequelize.literal(
    //       `Round(ST_Distance_Sphere(coordinate, ST_GeomFromText('POINT(${mapCenterLocation.longitude} ${
    //         mapCenterLocation.latitude
    //       })')), 0) <= '${200000}'`
    //     )
    //   );
    // }

    if (busiId) {
      if (!busiId.includes('HDO')) {
        where[Op.and].push(sequelize.literal('1=2'));
      }
    }

    let options = {
      where,
      include: [
        {
          model: models.sb_charger,
          as: 'chargers',
          attributes: ['chg_id', 'status', 'charger_status', 'chg_unit_price'],
          include: [
            {
              model: models.sb_charger_state,
              as: 'chargerStates',
              attributes: ['cs_charging_state'],
            },
            {
              model: models.ChargerModel,
              as: 'chargerModel',
              attributes: ['connectorType', 'maxKw'],
            },
            {
              model: models.UnitPriceSet,
              as: 'UnitPriceSet',
              attributes: [[sequelize.literal(`unitPrice${nowHour + 1}`), 'unitPrice']],
            },
          ],
        },
        {
          model: models.Org,
          as: 'org',
          attributes: ['address', 'name'],
        },
        // {
        //   model: models.UsersNew,
        //   as: 'createdBy',
        //   attributes: ['id', 'accountId', 'name', 'status', 'orgId'],
        // },
        // {
        //   model: models.UsersNew,
        //   as: 'updatedBy',
        //   attributes: ['id', 'accountId', 'name', 'status', 'orgId'],
        // },
        // {
        //   model: models.UsersNew,
        //   as: 'operatorManager',
        //   attributes: ['id', 'accountId', 'name', 'status', 'orgId'],
        // },
      ],
      attributes: {
        include: [
          'chgs_station_id',
          'status',
          'chgs_name',
          'coordinate',
          [sequelize.literal("''"), 'limits'],
          [sequelize.literal("'HDO'"), 'busiId'],
          [sequelize.literal("''"), 'createdBy'],
          [sequelize.literal("''"), 'updatedBy'],
          [sequelize.literal("''"), 'operatorManager'],
          [
            sequelize.literal(`
            (( 6371 * acos( cos( radians(${userLocation.latitude}) ) * cos( radians( ST_Y(coordinate) ) ) * cos( radians( ST_X(coordinate) ) - radians(${userLocation.longitude}) ) + sin( radians(${userLocation.latitude}) ) * sin( radians( ST_Y(coordinate) ) ) ) ) * 1000)
            `),
            'distance',
          ],
          [
            sequelize.literal(`
            (( 6371 * acos( cos( radians(${mapCenterLocation.latitude}) ) * cos( radians( ST_Y(coordinate) ) ) * cos( radians( ST_X(coordinate) ) - radians(${mapCenterLocation.longitude}) ) + sin( radians(${mapCenterLocation.latitude}) ) * sin( radians( ST_Y(coordinate) ) ) ) ) * 1000)
            `),
            'distanceFromMapCenter',
          ],
        ],
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
      group: ['sb_charging_station.chgs_id'],
      order: [['distanceFromMapCenter']],
      subQuery: false,
    };
    const { count: totalCount, rows: stations } = await models.sb_charging_station.findAndCountAll(options);

    const stationStatus = [];
    let stations_ = stations.map((value) => {
      value.chargers.forEach((item, index) => {
        const chargersStatus = [];
        if (item.chargerStates && item.chargerStates.length > 0) {
          item.chargerStates.forEach((i) => {
            stationStatus.push(i.cs_charging_state);
            chargersStatus.push(i.cs_charging_state);
          });
        }

        value.chargers[index].status = [...new Set(chargersStatus)].includes('available') ? 'ACTIVE' : 'INACTIVE';
      });

      return {
        ...value.dataValues,
        status: [...new Set(stationStatus)].includes('available') ? 'ACTIVE' : 'INACTIVE',
      };
    });

    stations_ = stations_.concat(otherStationWithChargers).sort((a, b) => a?.distance - b?.distance);
    // .slice(0, 50);

    // upSetId 추출
    let upSetIds = [];
    stations_.forEach((station) => {
      if (station.chargers) {
        station.chargers.forEach((chg) => {
          if (chg && chg.upSetId) {
            // TODO what value to push to this???
            upSetIds.push(chg.upSetId);
          }
        });
      }
    });
    upSetIds = [...new Set(upSetIds)];

    // UnitPriceSet 한 번에 조회
    const priceSets = await models.UnitPriceSet.findAll({
      where: { id: upSetIds },
    });

    const priceSetMap = priceSets.reduce((map, priceSet) => {
      map[priceSet.id] = priceSet;
      return map;
    }, {});

    const favoriteStations = await models.FavoriteChargerStation.findAll({
      where: { userId: userId },
    });

    const favoriteMap = favoriteStations.reduce((map, fav) => {
      map[fav.chargerId] = true;
      return map;
    }, {});

    const stationsWithFavorite_ = await Promise.all(
      stations_.map(async (station) => {
        let { chargers } = station;
        if (chargers) {
          chargers = chargers.map((chg) => {
            const chgJson = chg.toJSON ? chg.toJSON() : chg;
            const priceSet = priceSetMap[chgJson.upSetId];
            if (priceSet && !chgJson.chg_unit_price && priceSet[`unitPrice${nowHour + 1}`]) {
              chgJson.chg_unit_price = priceSet[`unitPrice${nowHour + 1}`];
            }
            return chgJson;
          });

          chargers.sort((a, b) => a.chg_unit_price - b.chg_unit_price);
        }

        return {
          ...station,
          isFavorite: !!favoriteMap[station.chgs_id || station.chgs_station_id],
          unitPrice: getUnitPrice(chargers),
        };
      })
    );

    // const stationsWithFavorite_ = await Promise.all(
    // stations_.map(async (station) => {
    //   //Get minimum unit price
    //   let { chargers } = _.cloneDeep(station);
    //   if (chargers) {
    //     chargers = await Promise.all(
    //       chargers.map(async (chg) => {
    //         if (chg && typeof chg.toJSON === 'function') {
    //           const chgJson = chg.toJSON();
    //           if (!chgJson.chg_unit_price) {
    //             const priceSet = await models.UnitPriceSet.findOne({
    //               where: {
    //                 id: chgJson.upSetId,
    //               },
    //             });
    //             chgJson.chg_unit_price = 0;
    //             if (priceSet && priceSet[`unitPrice${nowHour + 1}`]) {
    //               chgJson.chg_unit_price = priceSet[`unitPrice${nowHour + 1}`];
    //             }
    //           }
    //           return chgJson;
    //         } else {
    //           return 0;
    //         }
    //       })
    //     );
    //     chargers.sort((a, b) => a.chg_unit_price - b.chg_unit_price);
    //   }

    //   const isFavorite = await models.FavoriteChargerStation.findOne({
    //     where: {
    //       chargerId: station.chgs_id,
    //       userId: userId,
    //     },
    //   });
    //   return {
    //     ...station,
    //     isFavorite: isFavorite ? true : false,
    //     unitPrice: getUnitPrice(chargers),
    //   };
    // })
    //  );

    const sumCount = parseInt(stationsWithFavorite_.length);

    return _response.json({
      result: stationsWithFavorite_,
      sumCount,
    });
  } catch (error) {
    console.error(error);
    next(error);
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
  _response.error.unknown(_error.toString());
  next(_error);
}
