'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/vehicles'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.createdAt = body.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.createdWho = userId;
  body.updatedWho = userId;
  body.usersNewId = userId;

  try {
    //Check duplicated vehicle
    const vehicle = await models.Vehicle.findOne({
      where: {
        numberPlate: body.numberPlate,
      },
    });

    if (vehicle) throw 'VEHICLE_IS_EXIST';

    const result = await models.Vehicle.create(body);
    result.save();

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

  if (_error === 'VEHICLE_IS_EXIST') {
    _response.error.badRequest(_error, '이 번호판은 존재합니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
