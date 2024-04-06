/**
 * Created by inju on 2023-06-05.
 * Refactored by Jackie Yoon on 2023-07-25.
 * 충전기 모델 생성
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/charger-model'],
  method: 'post',
  checkToken: true,
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

  try {
    if (body.id) body.id = undefined;
    if (!body.modelCode) throw 'NOT_EXIST_MODEL_CODE';

    // CodeLookUp 테이블을 참조하는 값이 있으면 올바른 값인지 검증
    if (body.speedType) {
      await checkAndThrowInvalidValue('SPEED_TYPE', body.speedType, 'descVal');
    }
    if (body.connectorType) {
      await checkAndThrowInvalidValue('CON_TYPE', body.connectorType, 'descVal');
    }

    // 이미 해당 모델이 존재하는지 체크
    const checkExistChargerModel = await models.ChargerModel.findOne({
      where: { modelCode: body.modelCode, deletedAt: null },
    });
    if (checkExistChargerModel) throw 'ALREADY_EXIST_CHARGER_MODEL_ID';

    const chargerModel = await models.ChargerModel.create(body);
    chargerModel.save();

    _response.json({
      result: chargerModel,
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

  if (_error === 'ALREADY_EXIST_CHARGER_MODEL_ID') {
    _response.error.badRequest(_error, '해당 충전기 모델이 이미 존재합니다.');
    return;
  }

  if (_error === 'INVALID_SPEED_TYPE') {
    _response.error.badRequest(_error, '허용되지 않은 충전속도를 사용할 수 없습니다.');
    return;
  }

  if (_error === 'INVALID_CON_TYPE') {
    _response.error.badRequest(_error, '허용되지 않은 커넥터 타입을 사용할 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

// CodeLookUp 테이블을 참조하는 값이 있으면 올바른 값인지 검증
async function checkAndThrowInvalidValue(divCode, bodyValue, attributeName) {
  let formattedValue = bodyValue.toString().toLowerCase();
  const result = await models.CodeLookUp.findOne({
    where: { divCode: divCode, [attributeName]: formattedValue },
    attributes: [attributeName],
    raw: true,
  });

  if (!result) {
    throw `INVALID_${divCode}`;
  }
}
