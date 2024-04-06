'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');

module.exports = {
  path: '/vehicles-delete-one/:vehiclesId',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.delete],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  
  try {
    const usersNewId = _request.user.id;
    const id = _request.params.vehiclesId; 

    const myVehicle = await models.Vehicle.findOne({
      where: {
        id,
        usersNewId, 
      }
    }); 
    if (!myVehicle) throw 'NOT_EXIST_VEHICLES_MODEL';

    const deletedVehicles = await myVehicle.destroy();

    // 삭제된 충전기 모델 정보 응답
    _response.json({
      status: '200',
      result: deletedVehicles,
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
    _response.error.notFound(_error, 'cannot find vehicles.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
