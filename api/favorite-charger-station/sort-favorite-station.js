'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/favorite-station/sort'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const body = _request.body.data
    await Promise.all(
        body.map(async ({sortNumber, id}) => {
            await models.FavoriteChargerStation.update({
                sortNumber: sortNumber,
            }, {
                where: {
                    id: id
                }
            })
        })
    )
    _response.json({
      result: 'Updated',
    });
  } catch (e) {
    console.log('err: ', e)
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
