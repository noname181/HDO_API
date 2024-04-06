'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/vehicles/:vehiclesId'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const vehiclesId = _request.params.vehiclesId;
  try {
    // 해당 충전기 모델이 존재하는지 확인
    const vehicles = await models.Vehicle.findByPk(vehiclesId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!vehicles) throw 'NOT_EXIST_VEHICLES_MODEL';

    // 충전기 모델 응답
    _response.json({
      result: vehicles,
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
    _response.error.notFound(_error, 'Can not find vehicles.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
