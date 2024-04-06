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
const { clearInterval } = require('timers');


module.exports = {
  path: ['/charging-stations-on-map-new'],
  method: 'get',
  checkToken: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
   
  try {
    const userId = _request?.user?.id || _request?.user?.sub || null; // API 호출자의 user id
 
    const statusENV = _request.query.status ? 2 : null;
 
    const limits = _request.query.limits || null;
 
    const { body } = _request;
    
    // const networkInterfaces = os.networkInterfaces(); 
    // let ipAddress;
    // for (const [, interfaces] of Object.entries(networkInterfaces)) {
    //   for (const iface of interfaces) {
    //     if (iface.family === 'IPv4' && !iface.internal) {
    //       ipAddress = iface.address; 
    //       break;
    //     }
    //   }
    //   if (ipAddress) {
    //     break;
    //   }
    // }  

    const mapCenterLocation = {
      latitude: _request.query?.lat || 0,
      longitude: _request.query?.lng || 0,
    };

    const userLocation = {
      latitude: _request.query?.userLat || 0,
      longitude: _request.query?.userLng || 0,
    };

    let { busiId, connectorType, speed } = body;
    busiId = busiId ? busiId.sort() : [];
    connectorType = connectorType ? connectorType.sort((a, b) => a - b) : [];
    speed = speed ? speed.sort((a, b) => a - b) : [];
    console.log('body::::',body)
    const nowHour = moment().tz('Asia/Seoul').hours(); 
    const allBusiId = [
      'AM', 'AT', 'BA', 'BE', 'BN', 'BT', 'BW', 'CG', 'CJ',
      'CP', 'CS', 'CU', 'CV', 'DE', 'DG', 'DP', 'EC', 'EE',
      'EK', 'EL', 'EM', 'EN', 'EO', 'EP', 'ET', 'EV', 'G2',
      'GM', 'GP', 'GR', 'GS', 'HD', 'HE', 'HM', 'HP', 'HW',
      'HY', 'IK', 'IM', 'IN', 'JC', 'JD', 'JJ', 'JT', 'JU',
      'JV', 'KC', 'KE', 'KH', 'KL', 'KM', 'KO', 'KP', 'KS',
      'LC', 'LI', 'LU', 'LV', 'ME', 'MO', 'MT', 'NB', 'NE',
      'NJ', 'NT', 'PI', 'PK', 'PL', 'PS', 'PW', 'RE', 'SB',
      'SC', 'SE', 'SF', 'SG', 'SJ', 'SK', 'SM', 'SN', 'SS',
      'TB', 'TD', 'TS', 'TU', 'UN', 'US', 'WB'
    ];

    const allSpeed = [3, 7, 50, 100, 200];

    const allConnectorType = [1, 2, 3, 4, 5, 6, 7];

    let whereENV = [];  
    let whereHDO = [];
    let speedHDO = []; 
    let speedENV = []; 
    let connectorTypeHDO = []; 
    let connectorTypeENV = [];   
    //if (speed && speed.length > 0 && !arraysAreEqual(speed, allSpeed)) {
    if (speed && speed.length > 0){ 
        // whereENV.push( ` T1.output IN (${speed.map(String).join(",")}) `); 
        speed.map((item)=>{
          speedENV.push( ` T1.output${item} = 1 `);
        })
        whereENV.push( ` ( ` + speedENV.join(' OR ') + `) `);
        if(speed.every(item => allSpeed.includes(item))){  
          if([200].every(item => speed.includes(item))){
            speedHDO.push(1); 
          }  
          if([100].every(item => speed.includes(item))){
            speedHDO.push(2); 
          }
          if([50].every(item => speed.includes(item))){
            speedHDO.push(3); 
          }
          if([3,7].every(item => speed.includes(item))){
            speedHDO.push(4); 
          } 
          whereHDO.push( ` ChargerModels.speedType IN ('${speedHDO.map(String).join("','")}') ` );
        }
    } else {
      whereENV.push( ` 1 = 2 ` );
      whereHDO.push( ` 1 = 2 ` );
    }

    if (statusENV) { 
        whereENV.push( ` T1.stat = ${statusENV} `);
        whereHDO.push( ` sb_charger_states.cs_charging_state = 'available' `);
    }

    if (limits) { 
      whereENV.push( ` T1.limitYn = '${limits}' `);
      if(limits === 'N')
        whereHDO.push( ` sb_chargers.deletedAt IS NULL `);
    }


    //if (connectorType && connectorType.length > 0 && !arraysAreEqual(connectorType, allConnectorType)) { 
    //if (connectorType && connectorType.length > 0){
    if (connectorType  && connectorType.length > 0){ 
      // whereENV.push( ` T1.chgerType IN (${connectorType.map(String).join(",")}) `); 
      connectorType.map((item)=>{
        connectorTypeENV.push( ` T1.chgerType${item} = 1 `);
      })
      whereENV.push( ` ( ` + connectorTypeENV.join(' OR ') + `) `);
      if(connectorType.every(item => allConnectorType.includes(item))){ 
        if([2].every(item => connectorType.includes(item))){
          connectorTypeHDO.push(2);
        }
        if([4,5,6].every(item => connectorType.includes(item))){
          connectorTypeHDO.push(4,5,6);
        }
        if([1,3,5,6].every(item => connectorType.includes(item))){
          connectorTypeHDO.push(1,3,5,6);
        }
        if([3,6,7].every(item => connectorType.includes(item))){
          connectorTypeHDO.push(3,6,7);
        } 
        let newConnectorTypeHDO = [...new Set(connectorTypeHDO)].sort((a, b) => a - b);
        whereHDO.push( ` ChargerModels.connectorType IN ('${newConnectorTypeHDO.map(String).join("','")}') ` );
      }
    } else {
      whereENV.push( ` 1 = 2 ` );
      whereHDO.push( ` 1 = 2 ` );
    }

    if (busiId && busiId.length > 0 && !arraysAreEqual(busiId, allBusiId)) {   
        whereENV.push( ` T1.busiId IN ('${busiId.map(String).join("','")}') `);
    } else if (busiId && busiId.length === 0){
        whereENV.push( ` 1 = 2 ` );
    }

    let filterENV = '';
    if(whereENV && whereENV.length > 0){
      filterENV = ' AND ' + whereENV.join(' AND ');
    }
    let filterHDO = '';
    if(whereHDO && whereHDO.length > 0){
      filterHDO = ' AND ' + whereHDO.join(' AND ');
    }
  
    let stations = await getStations(mapCenterLocation, userLocation, nowHour, userId, filterENV, filterHDO);
 
    return _response.json({
      result: stations, 
      sumCount: stations.length,
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

function isPlainObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj) && !(obj instanceof Date);
}
  
async function getStations(mapCenterLocation, userLocation, nowHour, userId, filterENV, filterHDO){ 
    const envQuery = `
    SELECT 
    T1.id AS chgs_id, 
    T1.statId,
    T1.statId AS favId,
    T1.statNm AS chgs_name, 
    T1.lat, 
    T1.lng, 
    T1.addr AS address, 
    NULL AS haveCarWash, 
    NULL limitYn, 
    NULL AS chgerType, 
    T1.statId AS chgs_station_id, 
    NULL AS cs_charging_state, 
    NULL AS connectorType, 
    NULL AS maxKw, 
    NULL AS unitPrice, 
    NULL AS unitPriceSet, 
    'other' AS company, 
    NULL AS output, 
    T1.busiId,  
    T1.stat, 
    NULL AS chg_id, 
    ST_DISTANCE_SPHERE(
      POINT(
        ${userLocation.longitude}, ${userLocation.latitude}
      ), 
      POINT(T1.lng, T1.lat)
    ) AS distance, 
    ST_DISTANCE_SPHERE(
      POINT(
        ${mapCenterLocation.longitude}, 
        ${mapCenterLocation.latitude}
      ), 
      POINT(T1.lng, T1.lat)
    ) AS distanceFromMapCenter 
    FROM 
    EnvChargeStations T1 
    WHERE 
      1 = 1 ${filterENV} 
    ORDER BY 
      distanceFromMapCenter 
    LIMIT 
      50 
`
; 

    const hdoQuery = `  
    SELECT 
      chgs_id, 
      "" AS statId,
      CONVERT(chgs_id, CHAR) AS favId,
      chgs_name, 
      ST_Y(coordinate) AS lat, 
      ST_X(coordinate) AS lng, 
      (
        SELECT 
          address 
        FROM 
          Orgs 
        WHERE 
          sb_charging_stations.orgId = Orgs.id 
          AND Orgs.deletedAt IS NULL 
        LIMIT 
          1
      ) AS address, 
      (
        SELECT 
          haveCarWash 
        FROM 
          Orgs 
        WHERE 
          sb_charging_stations.orgId = Orgs.id 
          AND Orgs.deletedAt IS NULL 
        LIMIT 
          1
      ) AS haveCarWash, 
      NULL AS limitYn, 
      NULL AS chgerType, 
      chgs_station_id, 
      (
        SELECT 
          cs_charging_state 
        FROM 
          sb_charger_states 
        WHERE 
          chg_id IN (
            SELECT 
              sb_chargers.chg_id 
            FROM 
              sb_chargers 
            LEFT OUTER JOIN 
              ChargerModels ON sb_chargers.chargerModelId = ChargerModels.id AND ChargerModels.deletedAt IS NULL
            LEFT OUTER JOIN 
              sb_charger_states ON sb_chargers.chg_id = sb_charger_states.chg_id AND sb_charger_states.deletedAt IS NULL 
            WHERE 
              sb_chargers.chgs_id = sb_charging_stations.chgs_id 
              AND sb_chargers.deletedAt IS NULL ${filterHDO} 
          ) 
          AND deletedAt IS NULL 
        ORDER BY 
          FIELD(cs_charging_state, 'available') DESC 
        LIMIT 
          1
      ) AS cs_charging_state, 
      (
        SELECT 
          connectorType 
        FROM 
          sb_chargers 
        LEFT OUTER JOIN 
          ChargerModels ON sb_chargers.chargerModelId = ChargerModels.id AND ChargerModels.deletedAt IS NULL
        LEFT OUTER JOIN 
          sb_charger_states ON sb_chargers.chg_id = sb_charger_states.chg_id AND sb_charger_states.deletedAt IS NULL 
        WHERE 
          sb_charging_stations.chgs_id = sb_chargers.chgs_id  
          AND sb_chargers.deletedAt IS NULL ${filterHDO} 
        LIMIT 
          1
      ) AS connectorType, 
      (
        SELECT 
          maxKw 
        FROM 
          sb_chargers 
        LEFT OUTER JOIN 
          ChargerModels ON sb_chargers.chargerModelId = ChargerModels.id AND ChargerModels.deletedAt IS NULL
        LEFT OUTER JOIN 
          sb_charger_states ON sb_chargers.chg_id = sb_charger_states.chg_id AND sb_charger_states.deletedAt IS NULL 
        WHERE 
          sb_charging_stations.chgs_id = sb_chargers.chgs_id  
          AND sb_chargers.deletedAt IS NULL ${filterHDO} 
        LIMIT 
          1
      ) AS maxKw, 
      (
        SELECT 
          chg_unit_price 
        FROM 
          sb_chargers 
        WHERE 
          chg_id in (
            SELECT 
              sb_chargers.chg_id 
            FROM 
              sb_chargers 
            LEFT OUTER JOIN 
              ChargerModels ON sb_chargers.chargerModelId = ChargerModels.id AND ChargerModels.deletedAt IS NULL
            LEFT OUTER JOIN 
              sb_charger_states ON sb_chargers.chg_id = sb_charger_states.chg_id AND sb_charger_states.deletedAt IS NULL 
            WHERE 
              chgs_id = sb_charging_stations.chgs_id 
              AND sb_chargers.deletedAt IS NULL ${filterHDO}
          ) 
          AND deletedAt IS NULL 
        ORDER BY 
          chg_unit_price 
        LIMIT 
          1
      ) AS unitPrice, 
      (
        SELECT 
          unitPrice${nowHour + 1} 
        FROM 
          UnitPriceSets 
        WHERE 
          id in (
            SELECT 
              upSetId 
            FROM 
              sb_chargers 
            LEFT OUTER JOIN 
              ChargerModels ON sb_chargers.chargerModelId = ChargerModels.id AND ChargerModels.deletedAt IS NULL
            LEFT OUTER JOIN 
              sb_charger_states ON sb_chargers.chg_id = sb_charger_states.chg_id AND sb_charger_states.deletedAt IS NULL 
            WHERE 
              sb_chargers.chgs_id = sb_charging_stations.chgs_id 
              AND sb_chargers.usePreset = 'Y' 
              AND sb_chargers.deletedAt IS NULL ${filterHDO}
          ) 
          AND deletedAt IS NULL 
        ORDER BY 
          unitPrice${nowHour + 1} 
        LIMIT 
          1
      ) AS unitPriceSet, 
      'hdo' AS company, 
      NULL AS output, 
      'HDO' AS busiId, 
      NULL AS stat, 
      (
        SELECT 
          sb_chargers.chg_id 
        FROM 
          sb_chargers 
        LEFT OUTER JOIN 
          ChargerModels ON sb_chargers.chargerModelId = ChargerModels.id AND ChargerModels.deletedAt IS NULL
        LEFT OUTER JOIN 
          sb_charger_states ON sb_chargers.chg_id = sb_charger_states.chg_id AND sb_charger_states.deletedAt IS NULL 
        WHERE 
          sb_charging_stations.chgs_id = sb_chargers.chgs_id  AND sb_chargers.deletedAt IS NULL ${filterHDO}
        LIMIT 
          1
      ) AS chg_id, 
      ST_DISTANCE_SPHERE(
        POINT(
          ${userLocation.longitude}, ${userLocation.latitude}
        ), 
        POINT(
          ST_X(coordinate), 
          ST_Y(coordinate)
        )
      ) AS distance,
      ST_DISTANCE_SPHERE(
        POINT(
          ${mapCenterLocation.longitude}, ${mapCenterLocation.latitude}
        ), 
        POINT(
          ST_X(coordinate), 
          ST_Y(coordinate)
        )
      ) AS distanceFromMapCenter 
    FROM 
      sb_charging_stations 
    WHERE 
      deletedAt IS NULL 
      AND coordinate IS NOT NULL 
      AND status = 'ACTIVE' 
      AND (
        ST_DISTANCE_SPHERE(
          POINT(
            ${mapCenterLocation.longitude}, 
            ${mapCenterLocation.latitude}
          ), 
          POINT(
            ST_X(coordinate), 
            ST_Y(coordinate)
          )
        )
      ) <= 1000 ${filterHDO ? ` AND EXISTS (
              SELECT 1
              FROM sb_chargers 
              LEFT OUTER 
              JOIN ChargerModels ON sb_chargers.chargerModelId = ChargerModels.id AND ChargerModels.deletedAt IS NULL
              LEFT OUTER
              JOIN sb_charger_states ON sb_chargers.chg_id = sb_charger_states.chg_id AND sb_charger_states.deletedAt IS NULL 
              WHERE sb_chargers.chgs_id = sb_charging_stations.chgs_id AND sb_chargers.deletedAt IS NULL 
                  ` + filterHDO + ` 
              GROUP BY sb_chargers.chg_id 
              LIMIT 1
              )` : `` }

    `; 

    // console.log('envQuery:::::', envQuery)
    //  console.log('hdoQuery:::::', hdoQuery)
    let envStations = await models.sequelize.query(envQuery,
    {
      type: sequelize.QueryTypes.SELECT,
    }
    );

    let hdoStations = await models.sequelize.query(hdoQuery,
    {
      type: sequelize.QueryTypes.SELECT,
    }
    ); 
 
    let allStations = [
      ...envStations, 
      ...hdoStations
    ];
  
    return allStations; 
}

function arraysAreEqual(arr1, arr2) {
  // Check if the lengths are equal
  if (arr1.length !== arr2.length) {
      return false;
  }

  // Check if every element in arr1 is equal to the corresponding element in arr2
  return arr1.every((element, index) => element === arr2[index]);
}

function groupBy(array, key) {
  return Object.values(array.reduce((result, currentItem) => {
      // Create a new group for this key if it doesn't exist
      result[currentItem[key]] = result[currentItem[key]] || currentItem;
      return result;
  }, {}));
}


function findIdByStatId(array, targetStatId) {
  const result = array.find(item => item.statId === targetStatId);
  return result ? result.id : null;
}

function checkFavorite(favoriteList, company, id) {
  if (company === "hdo") {
      return favoriteList.some(item => item.envChargerId === id);
  } else if (company === "other" ) {
      return favoriteList.some(item => item.chargerId === id);
  }
  return false;
}