'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
module.exports = {
  path: '/vehicle/:vehiclesId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = await _request.body;
  const vehiclesId = _request.params.vehiclesId;

  body.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;
  const usePnC = body.usePnC;
  try {
    const vehicles = await models.Vehicle.findByPk(vehiclesId);
    if (vehicles.usersNewId !== userId) throw 'NOT_UPDATE_BY_USER';
    if (!vehicles) throw 'NOT_EXIST_VEHICLES_MODEL';
    await vehicles.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    const updateVehicle = await models.Vehicle.findByPk(vehiclesId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    if (body.isPrimary && updateVehicle) {
      models.Vehicle.update(
        { isPrimary: false },
        {
          where: {
            id: {
              [Op.not]: vehiclesId,
            },
            usersNewId: userId,
          },
        }
      );
    }

    if (usePnC && updateVehicle) {
      models.Vehicle.update(
        { usePnC: usePnC },
        {
          where: {
            id: {
              [Op.not]: vehiclesId,
            },
            usersNewId: userId,
          },
        }
      );
    }''
    _response.json({
      status: '200',
      result: updateVehicle,
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

  if (_error === 'NOT_EXIST_VEHICLES_MODEL') {
    _response.error.notFound(_error, 'cannot find vehicles');
    return;
  }
  if (_error === 'NOT_UPDATE_BY_USER') {
    _response.error.notFound(_error, 'is not owned by you');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
