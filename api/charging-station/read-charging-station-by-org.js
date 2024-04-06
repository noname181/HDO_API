/**
 * Created by inju on 2023-12-08.
 * 충전소 조회 API
 * * TODO 우선 hdo 충전소 마커만 조회
 */
'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { Op, fn, col } = require('sequelize');

module.exports = {
  path: '/getChargers',
  method: 'get',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const latitude = parseFloat(_request.query.latitude); // 문자열을 숫자로 변환
    const longitude = parseFloat(_request.query.longitude); // 문자열을 숫자로 변환

    const radius = 10 / 111; // 10km 반경을 도(degree) 단위로 변환

    const { count, rows } = await models.EnvChargeStationTran.findAndCountAll({
      // where: {
      //   lat: {
      //     [Op.between]: [latitude - radius, latitude + radius],
      //   },
      //   lng: {
      //     [Op.between]: [
      //       longitude - radius / Math.cos(latitude * (Math.PI / 180)),
      //       longitude + radius / Math.cos(latitude * (Math.PI / 180)),
      //     ],
      //   },
      // },
    });

    let resultData = rows;

    if (count > 200) {
      let randomChargerData = new Set();
      while (randomChargerData.size < 200) {
        let randomIndex = Math.floor(Math.random() * count);
        let selectedData = rows[randomIndex];
        if (selectedData) {
          randomChargerData.add(selectedData);
        }
      }
      resultData = [...randomChargerData];
    }

    const dataSize = resultData.length;

    return _response.json({
      result: rows,
      dataSize: dataSize,
      totalCount: count,
      status: '200',
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
