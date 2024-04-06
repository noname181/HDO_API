'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/point'],
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

    let where = {};
    if (where[Op.and] === undefined) where[Op.and] = [];

    let options = {
      where: where,
      include: [
        {
          model: models.UsersNew,
          as: 'user',
          attributes: ['id', 'accountId', 'name', 'orgId'],
        },
        {
          model: models.UsersNew,
          as: 'createdBy',
          attributes: ['id', 'accountId', 'name', 'orgId'],
        },
        {
          model: models.UsersNew,
          as: 'updatedBy',
          attributes: ['id', 'accountId', 'name', 'orgId'],
        },
      ],
      attributes: {
        exclude: ['userId', 'createdWho', 'updatedWho', 'deletedAt'],
      },
      order: [['id', 'DESC']],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
    };

    const { count: totalCount, rows: points } = await models.Point.findAndCountAll(options);
    const pointList = points.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
      };
    });
    _response.json({
      totalCount: totalCount,
      result: pointList,
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
