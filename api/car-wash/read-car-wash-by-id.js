/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/car-wash/:carWashId',
  method: 'get',
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const carWashId = _request.params.carWashId;

  // Querying 옵션1 - 언어 전체 조회
  const option = {
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
    ],
    exclude: ['createdWho', 'updatedWho', 'deletedAt'],
  };

  try {
    if (!carWashId) throw 'NO_CAR_WASH_ID';

    const carWash = await models.CarWash.findByPk(carWashId, option);
    if (!carWash) throw 'NOT_EXIST_CAR_WASH';

    _response.json({
      result: carWash,
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

  if (_error === 'NOT_EXIST_CAR_WASH') {
    _response.error.notFound(_error, '소속 ID가 입력되지 않았습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CAR_WASH') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
