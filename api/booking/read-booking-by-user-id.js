/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/user-booking'],
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
    const { id } = _request.user;

    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
    const status = _request.query.status || null;
    const chg_id = _request.query.chg_id || null;
    const chgs_id = _request.query.chgs_id || null;

    const where = {
      userId: id,
      [Op.and]: [],
    };

    if (status) where[Op.and].push({ b_status: status });
    if (chg_id) where[Op.and].push({ chg_id: chg_id });
    if (chgs_id) where[Op.and].push({ chgs_id: chgs_id });

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
        // Vehicle 테이블의 경우
        {
          model: models.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'manufacturer', 'type', 'usePnC'],
        },
        // Charging Station 테이블의 경우
        {
          model: models.sb_charging_station,
          as: 'chargingStation',
          attributes: ['chgs_id', 'chgs_name', 'coordinate'],
        },
        // Charger 테이블의 경우
        {
          model: models.sb_charger,
          as: 'chargers',
          attributes: ['chg_id', 'chg_charger_id'],
        },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
      order: [['id', orderByQueryParam]],
    };

    const { count: totalCount, rows: bookings } = await models.Booking.findAndCountAll(options);
    _response.json({
      totalCount: totalCount,
      result: bookings,
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
