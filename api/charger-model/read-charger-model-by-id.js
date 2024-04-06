/**
 * Created by Jackie Yoon on 2023-07-26.
 * 충전기 모델 id로 조회
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/charger-model/:chargerModelId'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargerModelId = _request.params.chargerModelId;

  try {
    // 해당 충전기 모델이 존재하는지 확인
    const chargerModel = await models.ChargerModel.findByPk(chargerModelId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!chargerModel) throw 'NOT_EXIST_CHARGER_MODEL';

    // 충전기 모델 응답
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

  if (_error === 'NOT_EXIST_CHARGER_MODEL') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

async function checkAndThrowInvalidValue(divCode, bodyValue, attributeName, transaction) {
  let formattedValue = bodyValue.toString().toLowerCase();
  const result = await models.CodeLookUp.findOne({
    where: { divCode: divCode, [attributeName]: formattedValue },
    attributes: [attributeName],
    raw: true,
    transaction: transaction,
  });

  if (!result) {
    throw `INVALID_${divCode}`;
  }
}
