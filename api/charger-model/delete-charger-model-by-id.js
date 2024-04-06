/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 삭제
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/charger-model/:chargerModelId'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargerModelId = _request.params.chargerModelId;

  try {
    // 충전기 모델이 DB에 존재하는지 확인
    const chargerModel = await models.ChargerModel.findByPk(chargerModelId);
    if (!chargerModel) throw 'NOT_EXIST_CHARGER_MODEL';

    // 충전기 DB에 해당 충전기 모델이 일단 존재한다면 삭제할 수 없음
    const isExistModelInCharger = await models.sb_charger.findAll({
      where: { chargerModelId: chargerModel.id },
    });
    if (isExistModelInCharger.length > 0) throw 'CHARGER_MODEL_IS_USED';

    // 충전기 모델 삭제
    const deletedChargerModel = await chargerModel.destroy();

    // 삭제된 충전기 모델 정보 응답
    _response.json({
      status: '200',
      result: deletedChargerModel,
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

  if (_error === 'CHARGER_MODEL_IS_USED') {
    _response.error.badRequest(_error, '해당 충전기 모델이 충전기 데이터에 존재하기 때문에 삭제할 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
