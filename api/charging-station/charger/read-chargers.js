/**
 * Created by Sarc bae on 2023-06-01.
 * 충전소 조회 API
 */
'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/chargers', '/charging-stations/:chargingStationId/chargers'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargingStationId = _request.params.chargingStationId;

  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 9999;
  const searchWord = _request.query.search || null; // 요청 파라미터로 /search/뒤에 붙이던가, query 키 search를 통해 전달.

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  let where = {};

  if (searchWord) {
    where = {
      // [Op.or]: [
      //     {email: { [Op.like]: '%' + searchWord + '%' }},
      //     {userNameFull: { [Op.like]: '%' + searchWord + '%' }},
      //     {userNameReal: { [Op.like]: '%' + searchWord + '%' }}
      // ]
    };
  }

  if (chargingStationId) {
    where.chg_id = chargingStationId;
  }

  let options = {
    where: where,
    include: [
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: [['id', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };

  if (!chargingStationId) {
    options.include.push({
      model: models.sb_charging_station,
      as: 'chargingStation',
      attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
    });
    options.include.push({
      model: models.ChargerModel,
      as: 'chargerModel',
      attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
    });
  }

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: chargers } = await models.sb_charger.findAndCountAll(options);

    // 조회된 사용자 목록 응답
    _response.json({
      totalCount: totalCount,
      result: chargers,
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
