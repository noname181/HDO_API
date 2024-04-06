'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/unit-price-set/:unitPriceId',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.delete],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const unitPriceId = _request.params.unitPriceId;

  try {
    const unitPriceSet = await models.UnitPriceSet.findByPk(unitPriceId);

    if (!unitPriceSet) throw 'NOT_EXIST_UNIT_PRICE';

    //check unit price is using
    if (unitPriceSet.isUsed) throw 'IS_USING';

    const deletedUnitPrice = await unitPriceSet.destroy();

    _response.json({
      result: deletedUnitPrice,
    });
  } catch (e) {
    next(e);
  }
}

async function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'CONFLCT') {
    _response.error.badRequest('Unit price is being used.');
    return;
  }

  if (_error === 'IS_USING') {
    _response.error.notFound(_error, 'Unit price is being used.');
    return;
  }

  if (_error === 'NOT_EXIST_UNIT_PRICE') {
    _response.error.badRequest(_error, '해당 ID에 대한 소속이 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
