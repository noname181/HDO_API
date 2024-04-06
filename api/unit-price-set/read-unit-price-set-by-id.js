'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/unit-price-set/:unitPriceId',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const unitPriceId = _request.params.unitPriceId;

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
    if (!unitPriceId) throw 'NO_UNIT_PRICE_ID';

    const unitPriceSet = await models.UnitPriceSet.findByPk(unitPriceId, option);
    if (!unitPriceSet) throw 'NOT_EXIST_PRICE_ID';

    _response.json({
      result: unitPriceSet,
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

  if (_error === 'NO_UNIT_PRICE_ID') {
    _response.error.notFound(_error, '소속 ID가 입력되지 않았습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_PRICE_ID') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
