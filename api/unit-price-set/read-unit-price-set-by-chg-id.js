'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/charger-unit-price/:chg_id'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chg_id = parseInt(_request.params.chg_id);

  const option = {
    include: [
      {
        model: models.UnitPriceSet,
        attributes: {
          exclude: [
            'id',
            'createdWho',
            'updatedWho',
            'deletedAt',
            'unitPriceSetName',
            'registerDate',
            'isUsed',
            'createdAt',
            'updatedAt',
          ],
        },
        as: 'UnitPriceSet',
        required: false,
        on: sequelize.where(sequelize.col('sb_charger.upSetId'), '=', sequelize.col('UnitPriceSet.id')),
      },
    ],
    exclude: ['createdWho', 'updatedWho', 'deletedAt'],
  };

  try {
    const data = await models.sb_charger.findByPk(chg_id, option);
    if (!data) throw 'NOT_EXIST_CHARGE';
    const { usePreset, upSetId, chg_unit_price, UnitPriceSet } = data;

    _response.json({
      result: { usePreset, upSetId, chg_unit_price, unitPriceSet: UnitPriceSet },
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
