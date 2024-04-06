/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('lodash');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/unit-price-reservation/:reservationId',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const reservationId = _request.params.reservationId;

  const option = {
    include: [
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
        model: models.UnitPriceSet,
        as: 'unitPriceSet',
      },
      {
        model: models.sb_charger,
        as: 'charger',
      },
    ],
  };

  try {
    const result = await models.sb_unitprice_change_reservation.findByPk(reservationId, option);

    _response.json({
      result: result,
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
