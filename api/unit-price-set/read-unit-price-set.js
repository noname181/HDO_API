'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/unit-price-set'],
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

    const unitPriceSetName = _request.query.unitPriceSetName || null;
    const isUsed = _request.query.isUsed || null;

    const where = {
      [Op.and]: [],
    };
    if (unitPriceSetName) {
      where[Op.and].push({ unitPriceSetName: { [Op.like]: '%' + unitPriceSetName + '%' } });
    }
    if (isUsed && isUsed === 'false') where[Op.and].push({ isUsed: false });
    if (isUsed && isUsed === 'true') where[Op.and].push({ isUsed: true });

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
      order: [['createdAt', 'DESC']],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
    };

    const { count: totalCount, rows: unitPrice_ } = await models.UnitPriceSet.findAndCountAll(options);
    const unitPrices = unitPrice_.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
      };
    });
    _response.json({
      totalCount: totalCount,
      result: unitPrices,
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
