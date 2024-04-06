/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 수정
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const { Op } = require('sequelize');

module.exports = {
  path: ['/charger-model/:chargerModelId'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const chargerModelId = _request.params.chargerModelId;

  body.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;

  try {
    // 해당 충전기 모델이 이미 존재하는지 확인
    const chargerModel = await models.ChargerModel.findByPk(chargerModelId);
    if (!chargerModel) throw 'NOT_EXIST_CHARGER_MODEL';

    // body값 검증
    // CodeLookUp 테이블을 참조하는 값이 있으면 올바른 값인지 검증
    if (body.speedType) {
      await checkAndThrowInvalidValue('SPEED_TYPE', body.speedType, 'descVal');
    }
    if (body.connectorType) {
      await checkAndThrowInvalidValue('CON_TYPE', body.connectorType, 'descVal');
    }

    if (body.modelCode) {
      const checkExistChargerModel = await models.ChargerModel.findOne({
        where: { modelCode: body.modelCode, deletedAt: null, id: { [Op.ne]: chargerModelId } },
      });

      if (checkExistChargerModel) throw 'ALREADY_EXIST_CHARGER_MODEL_ID';
      await chargerModel.update(body, {
        attributes: {
          exclude: ['deletedAt'],
        },
        omitNull: true,
      });
    }

    // 수정된 충전기 모델 리로딩
    const updatedChargerModel = await models.ChargerModel.findByPk(chargerModelId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    _response.json({
      status: '200',
      result: updatedChargerModel,
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

  if (_error === 'NOT_EXIST_CHARGER_MODEL') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  if (_error === 'INVALID_SPEED_TYPE') {
    _response.error.badRequest(_error, '허용되지 않은 충전속도로 수정할 수 없습니다.');
    return;
  }

  if (_error === 'INVALID_CON_TYPE') {
    _response.error.badRequest(_error, '허용되지 않은 커넥터 타입으로 수정할 수 없습니다.');
    return;
  }

  if (
    _error['name'] === 'SequelizeUniqueConstraintError' ||
    _error.errors[0].message == 'charger_models_model_code must be unique'
  ) {
    _response.error.badRequest(
      'DUPLICATED_MODELCODE',
      'modelCode 중복 오류(다른 충전모델에 등록된 modelCode가 입력되었습니다.)'
    );
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
