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
  path: ['/coupon'],
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
    const couponNumber = _request.query.number || null;
    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
    let where = {};
    if (where[Op.and] === undefined) where[Op.and] = [];
    if (couponNumber) {
      where[Op.and].push({ number: { [Op.like]: '%' + couponNumber + '%' } });
    }
    let options = {
      where: where,
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
      order: [['id', orderByQueryParam]],
    };

    const { count: totalCount, rows: coupons } = await models.CouponModel.findAndCountAll(options);
    const coupon_ = coupons.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
      };
    });
    _response.json({ totalCount: totalCount, result: coupon_ });
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
