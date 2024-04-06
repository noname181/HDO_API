'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/exist-vehicles-plate'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;

  try {
    const existPlate = await models.Vehicle.findOne({
      where: { numberPlate: body.numberPlate },
    });
    if (existPlate) next('EXIST_VEHICLES_PLATE');

    // 충전기 모델 응답
    _response.json({
      result: 'OK',
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

  if (_error === 'EXIST_VEHICLES_PLATE') {
    _response.error.notFound(_error, '이 차량은 이미 등록되어 있습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
