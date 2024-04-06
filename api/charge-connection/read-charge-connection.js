'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/charge-connections'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    // 페이징 정보
    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
    let options = {
      where: {},
      include: [
        // User 테이블의 경우
        {
          model: models.UsersNew,
          as: 'createdBy',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
        },
        {
          model: models.UsersNew,
          as: 'updatedBy',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
        },
        {
          model: models.UsersNew,
          as: 'user',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
        },
        // Charging Station 테이블의 경우
        {
          model: models.sb_charging_station,
          as: 'chargingStation',
          attributes: ['chgs_id', 'chgs_name', 'coordinate', 'chrgStartTime', 'chrgEndTime'],
        },
        // Charger 테이블의 경우
        {
          model: models.ChargerModel,
          as: 'charger',
          attributes: ['id', 'modelCode', 'lastFirmwareVer', 'modelName', 'connectorType'],
        },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
      order: [['id', orderByQueryParam]],
    };

    const { count: totalCount, rows: chargeConnections } = await models.sb_charge_connection.findAndCountAll(options);
    const chargeConnections_ = chargeConnections.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
      };
    });
    _response.json({
      totalCount: totalCount,
      result: chargeConnections_,
    });
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
