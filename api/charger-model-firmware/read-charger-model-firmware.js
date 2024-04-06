/**
 * Created by inju on 2023-06-05.
 * 충전기 모델 펌웨어 read
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/model-firmware',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const modelIdData = _request.query;
    const modelId = modelIdData.modelId;
    let whereCondition = {};

    if (modelId) {
      whereCondition = {
        modelId: modelId,
        deletedAt: null,
      };
    } else {
      whereCondition = {
        deletedAt: null,
      };
    }

    const option = {
      where: whereCondition,
      order: [
        ['isLast', 'DESC'],
        ['id', 'DESC'],
      ],
    };

    // 조회시 충전기 모델이 존재하는 경우만 조회
    option.include = [
      {
        model: models.ChargerModel,
        as: 'chargerModel',
        required: true,
      },
    ];

    const { count: totalCount, rows: chargerModelFws } = await models.ChargerModelFW.findAndCountAll(option);
    _response.json({
      totalCount: totalCount,
      result: chargerModelFws,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _requst, _response, next) {
  console.error(_error);
}
