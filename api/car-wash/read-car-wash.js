/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/car-wash'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    // 페이징 정보
    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
    const car_number = _request.query.car_number || null;

    const where = {};
    if (car_number) {
      where.car_number = car_number;
    }

    let options = {
      where: where,
      include: [
        // User 테이블의 경우
        {
          model: models.UsersNew,
          as: 'createdBy',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
        },
        {
          model: models.UsersNew,
          as: 'updatedBy',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
        },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
      order: [['id', orderByQueryParam]],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
    };

    const { count: totalCount, rows: carWashes_ } = await models.CarWash.findAndCountAll(options);
    const carWashes = carWashes_.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
      };
    });
    _response.json({
      totalCount: totalCount,
      result: carWashes,
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
