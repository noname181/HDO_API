/**
 * Created by Sarc bae on 2023-07-12.
 * 사용자 위치 기반 충전소 조회 API - 지도조회용
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/charge-stations'],
  method: 'get',
  checkToken: false, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

// 그냥 쿼리에 따른 조회조건(radius 포함)
async function service(_request, _response, next) {
  const userId = _request.user?.id || _request?.user?.sub || 'testhdo1';
  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) + 1 : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'ASC').toUpperCase();

  // 위치 정보
  const coordinate = {
    latitude: _request.query.lat || 0,
    longitude: _request.query.lng || 0,
  };
  const radius = _request.query.rad;

  // 필터 정보
  const haveCarWash = _request.query.wash
    ? _request.query.wash.toUpperCase() === 'TRUE'
      ? 'Y'
      : _request.query.wash.toUpperCase() === 'FALSE'
      ? 'N'
      : _request.query.wash.toUpperCase()
    : 'A';
  const provider = _request.query.provider ? _request.query.provider.toUpperCase() : 'HDO'; // TODO 환경부나 서드파티 충전소들 추가시 분기용

  try {
    // let data = await models.sequelize.query(
    //   `CALL Proc_Get_Charging_Station_List_M('${userId}', ${coordinate.longitude}, ${coordinate.latitude}, '${haveCarWash}')`
    // );

    let data = await models.sequelize.query(
      `CALL Proc_Get_Charging_Station_List_M('dlswn666', 37.685121, 126.6127313, 'A');`
    );

    const _data = data.map((item) => {
      const {
        operComp, // operComp 키로 받음
        chgs_id,
        chgs_name,
        coordinate,
        address,
        distanceMeter,
        chrgStartTime,
        chrgEndTime,
        washStartTime,
        washEndTime,
        chgs_car_wash_yn,
        hyperCnt,
        lowCnt,
        availCnt,
        maxPower,
      } = item;

      return {
        coordinate: { latitude: coordinate['y'], longitude: coordinate['x'] },
        chgs_id,
        chgs_name,
        distance: distanceMeter,
        maxKw: maxPower,
        provider: operComp, // provider 키로 할당
        washable: checkWashTime(item),
        chargeable: checkChargable(data),
        address,
        isFavorite: false, // TODO 충전소 조회시 토큰/혹은 유저id가 들어오면 즐겨찾기 여부 확인
      };
    });

    _response.json({
      status: '200',
      // 'totalCount': Array.isArray(data) ? data : 0,
      result: _data,
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

  _response.error.unknown(_error.toString());
  next(_error);
}

function checkWashTime(data) {
  const { washStartTime, washEndTime, chgs_car_wash_yn } = data;
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  if (chgs_car_wash_yn === 'N') {
    return false;
  }
  if (chgs_car_wash_yn === 'Y' && currentTime >= washStartTime && currentTime <= washEndTime) {
    return true;
  }
  return false;
}

function checkChargable(data) {
  const { chrgStartTime, chrgEndTime, availCnt } = data;
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  if (availCnt > 0 && currentTime >= chrgStartTime && currentTime <= chrgEndTime) {
    return true;
  }
  return false;
}
