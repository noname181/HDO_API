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
  path: ['/search-charging-stations'],
  method: 'get',
  checkToken: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
   
  try {
    
    const statusENV = _request.query.status ? 2 : null;

    // 충전소 이름
    const name = _request.query.name || null;
    // 충전소 주소
    const address = _request.query.address || null; 
    
    const page = _request.query.page ?? 0;  
    const limit = _request.query.limit ?? 50; 
    const start = page * limit; 

    const userLocation = {
      latitude: _request.query?.userLat || 0,
      longitude: _request.query?.userLng || 0,
    };

    let whereENV = [];
    let whereHDO = [];  
    if (name) { 
        whereENV.push( ` EnvStations.statNm LIKE '%${name}%' `);
        whereHDO.push( ` chgs_name LIKE '%${name}%' `);
    }

    if (address) { 
        whereENV.push( ` EnvStations.addr LIKE '%${address}%' `);
        whereHDO.push( ` (
            SELECT 
              address 
            FROM 
              Orgs 
            WHERE 
              sb_charging_stations.orgId = Orgs.id 
              AND Orgs.deletedAt IS NULL 
            LIMIT 
              1
          ) LIKE '%${address}%' `);
    }
  
    let whereENVQuery = '';
    if(whereENV && whereENV.length > 0){
        whereENVQuery = ' AND ' + whereENV.join(' AND ');
    } 

    let whereHDOQuery = '';
    if(whereHDO && whereHDO.length > 0){
        whereHDOQuery = ' AND ' + whereHDO.join(' AND ');
    } 
      
    const stations = await models.sequelize.query(
        `
        SELECT  
        * 
      FROM 
        (
          SELECT 
            AAA.* 
          FROM 
            (
              SELECT  
                EnvStations.id AS chgs_id,
                EnvStations.statId,
                EnvStations.statId AS favId,
                EnvStations.statNm AS chgs_name, 
                EnvStations.coordinate,  
                EnvStations.lat, 
                EnvStations.lng, 
                EnvStations.addr AS address,
                'other' AS company,
                ST_DISTANCE_SPHERE(
                  POINT(
                    ${userLocation.longitude}, ${userLocation.latitude}
                  ), 
                  POINT(lng, lat)
                ) AS distance 
              FROM 
                EnvChargeStations AS EnvStations   
                
             ${whereENVQuery
                ? 
                 `WHERE 1 = 1 ` + whereENVQuery

                : 
                `` 
             } 
             ORDER BY
               ${name ? ` chgs_name ` : ` address `}
            ) AS AAA  

            UNION 

        SELECT  
            BBB.*
        FROM 
            (
            SELECT 
                chgs_id,  
                NULL AS statId,
                CONVERT(chgs_id, CHAR) AS favId,
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
                'hdo' AS company,
                ST_DISTANCE_SPHERE(
                  POINT(
                    ${userLocation.longitude}, ${userLocation.latitude}
                  ), 
                  POINT(ST_X(coordinate), ST_Y(coordinate)) 
                ) AS distance 
            FROM 
                sb_charging_stations 
            WHERE 
                deletedAt IS NULL 
                AND coordinate IS NOT NULL 
                AND STATUS = 'ACTIVE' 
                ${whereHDOQuery} 
            ORDER BY
            ${name 
                ? 
                ` chgs_name ` 
                : 
                ` (
                SELECT 
                    address 
                FROM 
                    Orgs 
                WHERE 
                    sb_charging_stations.orgId = Orgs.id 
                    AND Orgs.deletedAt IS NULL 
                LIMIT 
                    1
                ) `}
            ) AS BBB 
        ) AS CCC  
       ORDER BY
        ${name ? ` chgs_name ` : ` address `}
       LIMIT 
        ${start},${limit}
    `,
    {
        type: sequelize.QueryTypes.SELECT,
    }
    ); 

    let stations_ = await Promise.all(stations.map(async (station) => { 
        return {
            chgs_id: parseInt(station.chgs_id),   
            statId: station.statId,   
            favId: station.favId,   
            chgs_name: station.chgs_name,
            coordinate: {
                x : isPlainObject(station.lng) ? parseFloat(String.fromCharCode(...station.lng)): parseFloat(station.lng), 
                y: isPlainObject(station.lat) ? parseFloat(String.fromCharCode(...station.lat)): parseFloat(station.lat)
            }, 
            org: {
              address: station.address, 
            },  
            company: station.company,
            distance: station.distance,
          };
    }))
  
   
    return _response.json({
      result: stations_, 
      sumCount: stations_.length,
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