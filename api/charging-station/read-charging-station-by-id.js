/**
 * Created by Sarc bae on 2023-07-14.
 * 충전소 조회 API
 * * TODO 우선 hdo 충전소 마커만 조회
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: '/charge-stations/:chgs_id',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const userId = _request.user.id || _request.user.sub || '';

  const chargeId = parseInt(_request.params.chgs_id) || 0;
  const provider = _request.query.provider || _request.params.provider || 'HDO'; // TODO 환경부쪽 추가할 경우 분기처리 요망 현재는 HDO 충전소들만 조회

  try {
    const dataWrap = await models.sequelize.query(`CALL Proc_Get_Charging_Station_Detail_M('${userId}', ${_chgs_id})`);
    const data = dataWrap[0];

    const _data = {
      coordinate: {
        longitude: data.coordinate['x'],
        latitude: data.coordinate['y'],
      },
      chgs_id: data.chgs_id || _chgs_id,
      chgs_name: data.chgs_name,
      address: data.address,
      isFavorite: data.favorite === 'Y',
      washable: checkWashTime(data),
      chargeable: checkChargable(data),
      maxKw: data.maxPower,
      hyperCnt: data.hyperCnt,
      lowCnt: data.lowCnt,
      pncCnt: data.pncCnt,
      unitPrice: data.unitPrice,
      member_unitPrice: data.member_unitPrice,
      chgs_field_desc: data.chgs_field_desc || '', // TODO 추후 충전소 관련 추가정보 필요
      shareInfo: data.shareInfo || '',
      phoneNo: '',
      chrgStartTime: data.chrgStartTime,
      chrgEndTime: data.chrgEndTime,
    };

    return _response.json({
      status: '200',
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

// true/false 분기처리가 필요한 쿼리용 함수
function convertQueryParam(value) {
  const lowercasedValue = value?.toLowerCase();

  return lowercasedValue === 'true'
    ? true
    : lowercasedValue === 'false'
    ? false
    : typeof value === 'string' && value !== ''
    ? value
    : undefined;
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
