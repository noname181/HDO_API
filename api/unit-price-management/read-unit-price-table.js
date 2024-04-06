/**
 * Created by Inju on 2023-06-20.
 * 타임테이블 헤더 조회 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/read-unit-price-table'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    //const { manufacturerId, modelName } = _request.query;

    const queryOptions = {
      where: {
        deletedAt: null,
      },
    };

    // like 검색을 위해 '%' 추가
    //const searchModelName = `%${modelName}%`;

    // if (manufacturerId) {
    //     queryOptions.where.manufacturerId = manufacturerId;
    // }

    // // modelName이 있는 경우만 추가
    // if (modelName) {
    //     queryOptions.where.modelName = {
    //         [models.Sequelize.Op.like]: `%${modelName}%`,
    //     };
    // }

    // 쿼리 실행
    const unitPriceTable = await models.UPTimeTable.findAll(queryOptions);

    const psUnitPriceTable = unitPriceTable.map((chargerModel) => {
      return chargerModel;
    });

    _response.json({
      result: psUnitPriceTable,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
