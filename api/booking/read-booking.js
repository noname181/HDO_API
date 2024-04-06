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
const {
  nameMask,
  userIdMask,
  phoneNoMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/booking'],
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
    const status = _request.query.status || null;
    const chg_id = _request.query.chg_id || null;
    const chgs_id = _request.query.chgs_id || null;
    const startDate = _request.query.startDate || null;
    const endDate = _request.query.endDate || null;
    const searchKey = _request.query.searchKey ? _request.query.searchKey : '';
    const searchVal = _request.query.searchVal ? _request.query.searchVal : '';
    const where = {
      [Op.and]: [],
    };

    if (status) where[Op.and].push({ b_status: status });
    if (chg_id) where[Op.and].push({ chg_id: chg_id });
    if (chgs_id) where[Op.and].push({ chgs_id: chgs_id });

    if (startDate && endDate) {
      where[Op.and].push({
        [Op.and]: [
          {
            b_time_in: {
              [Op.gte]: startDate,
            },
          },
          {
            b_time_out: {
              [Op.lte]: endDate,
            },
          },
        ],
      });
    }

    let options = {
      where: where,
      include: [
        // User 테이블의 경우
        {
          model: models.UsersNew,
          as: 'createdBy',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId', 'phoneNo'],
        },
        {
          model: models.UsersNew,
          as: 'updatedBy',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId', 'phoneNo'],
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
          attributes: ['chgs_id', 'chgs_name', 'coordinate', 'status', 'chgs_station_id'],
          paranoid: false,
          include: [
            {
              model: models.Org,
              foreignKey: 'orgId',
              paranoid: false,
              attributes: [
                'id',
                'category',
                'fullname',
                'name',
                'address',
                'area',
                'branch',
                'haveCarWash',
                'haveCVS',
                [
                  models.sequelize.literal(
                    `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`
                  ),
                  'branchName',
                ],
                [
                  models.sequelize.literal(
                    "(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)"
                  ),
                  'areaName',
                ],
              ],
              as: 'org',
            },
          ],
        },
        // Charger 테이블의 경우
        {
          model: models.sb_charger,
          as: 'chargers',
          attributes: ['chg_id', 'chg_charger_id'],
          include: [
            {
              model: models.ChargerModel,
              foreignKey: 'chargerModelId',
              attributes: { exclude: ['deletedAt'] },
              as: 'chargerModel',
            },
          ],
        },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
      order: [['id', orderByQueryParam]],
    };

    const SEARCH_KEY = {
      CHGS_STATION_ID: 'chgs_station_id',
      CHG_STATION_NAME: 'chgs_name',
      CHG_ID: 'chg_charger_id',
      ACCOUNT_ID: 'accountId',
      USERNAME: 'user_name',
      PHONE: 'phone',
    };

    if (searchKey || searchVal) {
      switch (searchKey) {
        case SEARCH_KEY.CHGS_STATION_ID:
          options.where[Op.and].push({ '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } });
          break;
        case SEARCH_KEY.CHG_STATION_NAME:
          options.where[Op.and].push({ '$chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } });
          break;
        case SEARCH_KEY.CHG_ID:
          options.where[Op.and].push({ chg_id: searchVal });
          break;
        case SEARCH_KEY.ACCOUNT_ID:
          options.where[Op.and].push({ '$createdBy.accountId$': { [Op.like]: '%' + searchVal + '%' } });
          break;
        case SEARCH_KEY.USERNAME:
          options.where[Op.and].push({ '$createdBy.name$': { [Op.like]: '%' + searchVal + '%' } });
          break;
        case SEARCH_KEY.PHONE:
          options.where[Op.and].push({ '$createdBy.phoneNo$': { [Op.like]: '%' + searchVal + '%' } });
          break;
        default:
          options.where[Op.and].push({
            [Op.or]: [
              { '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
              { '$chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } },
              { chg_id: searchVal },
              { '$createdBy.accountId$': { [Op.like]: '%' + searchVal + '%' } },
              { '$createdBy.name$': { [Op.like]: '%' + searchVal + '%' } },
              { '$createdBy.phoneNo$': { [Op.like]: '%' + searchVal + '%' } },
            ],
          });
          break;
      }
    }

    const { count: totalCount, rows: bookingsData } = await models.Booking.findAndCountAll(options);
    const bookings = [];
    for (let item of bookingsData) {
      const newItem = { ...item.dataValues };
      bookings.push({
        ...newItem,
        createdBy: {
          ...item.createdBy,
          accountId: userIdMask(item?.createdBy?.accountId ?? ''),
          name: nameMask(item?.createdBy?.name ?? ''),
          phoneNo: phoneNoMask(item?.createdBy?.phoneNo ?? ''),
        },
      });
    }
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
