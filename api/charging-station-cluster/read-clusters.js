/**
 * Created by Sarc bae on 2023-05-30.
 * Config 조회 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/charging-stations-cluster'],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // 페이징 정보
  const zoomLv = _request.query.zoomLv
    ? _request.query.zoomLv > 13
      ? 13
      : _request.query.zoomLv < 5
      ? 5
      : Math.round(_request.query.zoomLv * 2) / 2
    : 0;
  const bias = _request.query.bias ? parseInt(_request.query.bias) : 1000;
  const size = _request.query.size ? parseInt(_request.query.size) : 1;

  let where = {};
  if (zoomLv) where.zoomLevel = zoomLv;
  // 위치 정보
  const location = {
    latitude: _request.query.lat,
    longitude: _request.query.lng,
  };

  let options = {
    where: where,
    include: [
      // {model: models.CodeLookUp, foreignKey: 'parentId', as: 'childs', attributes: {exclude: ['deletedAt']}, constraints: false}
      // {model: models.CodeLookUp, as: 'children', required: false, where: whereChildren}
    ],
    attributes: {
      exclude: ['createdAt', 'zoomLevel', 'bias'],
    },
    // order: [['id', orderByQueryParam]],
    // offset: (pageNum * rowPerPage),
    // limit: rowPerPage,
    // distinct: true
  };

  let stationRadius;

  if (zoomLv) {
    const _radius = (-495000 / 8) * zoomLv + 799375;
    const radius = _radius > 500000 ? 500000 : _radius < 1000 ? 1000 : _radius;
    stationRadius = radius;
    if (_request.query.lat && _request.query.lat) {
      options.where[Op.and] = models.sequelize.literal(
        `Round(ST_Distance_Sphere(center, ST_GeomFromText('POINT(${location.longitude} ${location.latitude})')), 0) <= '${radius}'`
      );
    }
  }

  if (zoomLv > 10) {
    const stations = await models.sequelize.query(
      `
      SELECT 
      station.statId AS stationId, 
      station.statNm AS stationName,
      station.chgerType AS chargerType,
      station.addr AS stationAddress,
      station.lat AS lat,
      station.lng AS lng,
      station.parkingFree AS isParkingFree,
      station.limitYn AS isLimite,
      station.limitDetail AS limiteDetail,
      station.note AS stationNote,
      charger.chgerId AS chargerId,
      charger.stat AS chargerState,
      charger.output AS chargerOutput,
      charger.method AS chargerMethod,
      charger.busiId AS busiId,
      charger.bnm AS busNm
      FROM EnvChargeStations station
      LEFT OUTER JOIN
      EnvChargers charger ON station.statId = charger.statId
  WHERE 
      MBRContains(
          LineString(
              Point(${location.longitude} - ${location.latitude} / (111.1 / cos(RADIANS(${location.latitude}))), ${location.latitude} - :radius / 111.1),
              Point(${location.longitude} + ${location.latitude} / (111.1 / cos(RADIANS(${location.latitude}))), ${location.latitude} + :radius / 111.1)
          ),
          station.coordinate
      )
  LIMIT 
      :size
    `,
      {
        type: models.Sequelize.QueryTypes.SELECT,
        replacements: { radius: stationRadius, size: size },
      }
    );
    _response.json({
      status: '200',
      result: stations,
    });
  } else {
    try {
      // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
      const clusters = await models.ChargingStationCluster.findAll(options);

      // 조회된 클러스터 목록 응답
      _response.json({
        status: '200',
        result: clusters,
      });
    } catch (e) {
      next(e);
    }
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'CLUSTERS_NOT_EXIST') {
    _response.error.notFound(_error, '마커 클러스터 데이터 조회에 실패하였습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
