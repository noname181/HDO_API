/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 삭제
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/chargers/delete-batch'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargerIds = _request.body.chargerIds;

  try {
    if (!chargerIds || !Array.isArray(chargerIds) || chargerIds.length == 0) throw 'NO_REQUIRED_INPUT';

    for (let id of chargerIds) {
      const isExistModelInCharger = await models.sb_charger.findAll({
        where: { chargerModelId: id },
      });
      if (isExistModelInCharger.length > 0) throw 'CHARGER_MODEL_IS_USED';
    }

    await models.ChargerModel.update(
      { deletedAt: new Date() },
      {
        where: {
          id: {
            [Op.in]: chargerIds,
          },
        },
      },
      { force: false }
    );

    // 삭제된 충전기 모델 정보 응답
    _response.json({
      status: '200',
      message: 'Success',
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

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(chargerIds)');
    return;
  }

  if (_error === 'CHARGER_MODEL_IS_USED') {
    _response.error.badRequest(_error, '해당 충전기 모델이 충전기 데이터에 존재하기 때문에 삭제할 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
