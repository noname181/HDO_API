'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/codelookup/listDivcode'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const result = await models.CodeLookUp.findAll({
      where: {
        deletedAt: null,
      },
      attributes: ['divCode', [sequelize.literal('COUNT(*)'), 'subCodeCount'], 'id', 'divComment'],
      group: ['divCode'],
    });
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

  if (_error === 'NOT_VALID_REQUEST') {
    _response.error.badRequest(_error, '올바른 요청이 아닙니다.');
    return;
  }

  if (_error === 'WRONG_PARAMETER_TYPE_INPUT') {
    _response.error.badRequest(_error, '입력된 파라미터 타입이 INT가 아닙니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
