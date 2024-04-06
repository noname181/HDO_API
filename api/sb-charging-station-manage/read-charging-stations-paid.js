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
  path: ['/charging-stations-paid'],
  method: 'get',
  checkToken: true,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
   
  try {
    const userId = _request?.user?.id || _request?.user?.sub || null; // API 호출자의 user id
  
    const userLocation = {
      latitude: _request.query?.userLat || 0,
      longitude: _request.query?.userLng || 0,
    };
 
    const stations = await models.sequelize.query(
      ` 
              SELECT 
                DISTINCT sb_charging_logs.chgs_id, 
                NULL AS statId,
                sb_charging_logs.chgs_id AS favId, 
                chgs_name, 
                coordinate,  
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
                  '' AS limitYn,
                  '' AS chgerType,
                  chgs_station_id, 
                '' AS status,  
                (
                    SELECT 
                      cs_charging_state 
                    FROM 
                      sb_charger_states 
                    WHERE 
                      chg_id IN (
                        SELECT 
                          chg_id 
                        FROM 
                          sb_chargers 
                        WHERE 
                          sb_chargers.chgs_id = sb_charging_stations.chgs_id 
                          AND sb_chargers.deletedAt IS NULL
                      ) 
                      AND deletedAt IS NULL 
                    ORDER BY 
                     FIELD(cs_charging_state, 'available') DESC 
                    LIMIT 
                      1
                  ) AS cs_charging_state,    
                  'hdo' AS company,
                  '' AS output,
                'HDO' AS busiId,  
                '' AS stat,  (6371 * acos(cos(radians(${userLocation.latitude})) * cos(radians(ST_Y(coordinate))) * cos(radians(ST_X(coordinate)) - radians(${userLocation.longitude})) + sin(radians(${userLocation.latitude})) * sin(radians(ST_Y(coordinate))))) * 1000 AS distance  
              FROM 
                sb_charging_logs
                JOIN 
                sb_charging_stations 
                ON sb_charging_logs.chgs_id = sb_charging_stations.chgs_id 
              WHERE 
                sb_charging_stations.deletedAt IS NULL AND sb_charging_logs.deletedAt IS NULL 
                AND usersNewId = '${userId}' 
              GROUP BY 
                sb_charging_logs.chgs_id
              ORDER BY 
               sb_charging_logs.cl_unplug_datetime DESC 
    `,
    {
        type: sequelize.QueryTypes.SELECT,
    }
    ); 

    let stations_ = await Promise.all(stations.map(async (station) => {
      
        return {
            chgs_id: parseInt(station.chgs_id),
            statId: null,
            favId: station.chgs_id.toString(),
            envChargerId: parseInt(station.chgs_id),
            chgs_station_id: station.chgs_station_id,
            status: (station.stat && Number(station.stat) === 2) || station.cs_charging_state === 'available' ? 'ACTIVE' : 'INACTIVE',
            chgs_name: station.chgs_name,
            coordinate: {
                x : isPlainObject(station.lng) ? parseFloat(String.fromCharCode(...station.lng)): parseFloat(station.lng), 
                y: isPlainObject(station.lat) ? parseFloat(String.fromCharCode(...station.lat)): parseFloat(station.lat)
            }, 
            distance: station.distance, 
            chgs_id: station.chgs_id,
            status: station.cs_charging_state === 'available' ? 'ACTIVE' : 'INACTIVE', 
            chargerStates: [
            {
                cs_charging_state: station.cs_charging_state === 'available' ? 'available' : 'else',
            },
            ],  
            org: {
              address: station.address,
              haveCarWash: station.haveCarWash,
            },  
            company: station.company,
          };
    })) 
 
     const favoriteStations = await models.FavoriteChargerStation.findAll({
       where: { userId: userId },
     }); 
 
     const stationsWithFavorite_ = await Promise.all(
       stations_.map(async (station) => { 
         return {
           ...station, 
           isFavorite: favoriteStations.filter(item => (item.chargerId === station.chgs_id)).length > 0, 
         };
       })
     );
  
    return _response.json({
      result: stationsWithFavorite_, 
      sumCount: stationsWithFavorite_.length,
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