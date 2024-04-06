/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
// "use strict";
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/search'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    // 페이징 정보
    const userId = _request.user.sub || _request.user.id;
    const user = await models.UsersNew.findByPk(userId);

    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const searchQuery = _request.query.search || null;
    let where = {};
    if (where[Op.and] === undefined) where[Op.and] = [];
    if (!searchQuery) {
      return _response.json({
        result: [],
      });
    }
    where[Op.or] = [
      { chgs_name: { [Op.like]: `%${searchQuery}%` } },
      { chgs_station_id: { [Op.like]: `%${searchQuery}%` } },
      { status: { [Op.like]: `%${searchQuery}%` } },
    ];

    let options = {
      where: where,
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
      attributes: {
        exclude: ['deletedAt'],
      },
      include: [
        {
          model: models.Org,
          as: 'org',
          attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
        },
      ],
    };

    const data = await models.sb_charging_station.findAll(options);
    const result = data.map((value) => {
      return {
        chgs_name: value.chgs_name,
        chgs_station_id: value.chgs_station_id,
        status: value.status,
      };
    });
    _response.json({
      result: result,
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
