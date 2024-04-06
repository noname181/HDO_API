'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/unit-price-set'],
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
    const dateNow = new Date();
    const { body } = _request;
    body.createdAt = dateNow;
    body.updatedAt = dateNow;
    // body.status = new Date(body.effectiveDate) >= dateNow ? 'active' : 'inactive';
    body.registerDate = dateNow;
    const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
    body.createdWho = userId;
    body.updatedWho = userId;
    body.userId = userId;

    const priceSet = await models.UnitPriceSet.create(body);
    priceSet.save();

    _response.json({
      result: priceSet,
    });
  } catch (e) {
    next(e);
  }
}

async function validator(_request, _response, next) {
  const { body } = _request;

  const arrayKey = [
    'unitPrice1',
    'unitPrice2',
    'unitPrice3',
    'unitPrice4',
    'unitPrice5',
    'unitPrice6',
    'unitPrice7',
    'unitPrice8',
    'unitPrice9',
    'unitPrice10',
    'unitPrice11',
    'unitPrice12',
    'unitPrice13',
    'unitPrice14',
    'unitPrice15',
    'unitPrice16',
    'unitPrice17',
    'unitPrice18',
    'unitPrice19',
    'unitPrice20',
    'unitPrice21',
    'unitPrice22',
    'unitPrice23',
    'unitPrice24',
    'unitPriceSetName',
  ];

  for (const item of arrayKey) {
    if (body[item] === undefined) {
      next('MISSING_PARAMETER');
      return;
    }
  }

  const priceSet = await models.UnitPriceSet.findOne({
    where: {
      unitPriceSetName: body.unitPriceSetName,
    },
  });

  if (priceSet) next('DUPLICATE');
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'MISSING_PARAMETER') {
    _response.error.badRequest(_error, 'Missing parameters');
    return;
  }

  if (_error === 'DUPLICATE') {
    _response.error.badRequest(_error, 'Duplicate name');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
