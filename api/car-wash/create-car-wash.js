'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/car-wash'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const { body } = _request;
    body.createdAt = body.updatedAt = new Date();
    const userId = _request.user.id || _request.user.sub || 1; // API 호출자의 user id
    body.createdWho = userId;
    body.updatedWho = userId;
    body.userId = userId;

    const carWash = await models.CarWash.create(body);
    carWash.save();

    _response.json({
      result: carWash,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  const { car_number, member_name } = _request.body;

  if (!car_number || !member_name) next('Missing required parameter.');
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}
