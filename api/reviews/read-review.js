'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;
module.exports = {
  path: ['/review'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 9999;
  const chgs_id = _request.query.chgs_id;
  const statusImage = _request.query.Image === 'true';
  const orderByQueryParam = _request.query.order ? _request.query.order.toUpperCase() : 'DESC';
  const directionQueryParam = _request.query.direction ? _request.query.direction.toUpperCase() : 'DESC';
  const content = _request.query.content || null;
  let where = {};
  if (where[Op.and] === undefined) where[Op.and] = [];
  if (chgs_id) {
    where[Op.and].push({ chgs_id: chgs_id });
  }
  if (content) {
    where[Op.and].push({ content: { [Op.like]: '%' + content + '%' } });
  }
  if (statusImage) {
    where[Op.and].push({
      images: {
        [Op.not]: null,
      },
    });
  }

  //Found User report
  const userId = _request.user.id;
  const userReport = await models.UserBlock.findAll({
    where: {
      user_request: userId,
    },
    attributes: ['review_id', 'blocked_user'],
  });
  const listReviewReportIds = userReport.map((item) => item.review_id);
  const listUserBlockIds = userReport.map((item) => item.blocked_user);

  // Add condition: hide review reported by user request
  where[Op.and].push({
    id: {
      [Op.notIn]: listReviewReportIds.filter((item) => item),
    },
    createdWho: {
      [Op.notIn]: listUserBlockIds.filter((item) => item),
    },
    reported_user: {
      [Op.notIn]: listUserBlockIds.filter((item) => item),
    },
  });

  let options = {
    where: where,
    include: [
      {
        model: models.sb_charging_station,
        as: 'chargingStation',
        foreignKey: 'chgs_id',
        include: [
          {
            model: models.UsersNew,
            foreignKey: 'chgs_operator_manager_id',
            as: 'operatorManager',
          },
          {
            model: models.Org,
            foreignKey: 'orgId',
            as: 'org',
            attributes: [
              'area',
              'branch',
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
          },
        ],
      },
      {
        model: models.UsersNew,
        as: 'createdBy',
      },
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: [],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };
  let optionCount = {
    where: where,
  };
  if (orderByQueryParam === 'STARS' || orderByQueryParam === 'UPDATEDAT') {
    if (orderByQueryParam === 'STARS') {
      options.order.push(['stars', directionQueryParam]);
    } else {
      options.order.push(['updatedAt', directionQueryParam]);
    }
  } else {
    options.order.push(['id', directionQueryParam]);
  }
  try {
    const result = await models.Review.findAll(options);
    const average = await models.Review.findAll({
      where: where,
      attributes: [[sequelize.fn('avg', sequelize.col('stars')), 'averageStars']],
    });
    const totalCount = result.length;
    const dataAverage = average[0].dataValues.averageStars;
    const resultData = await Promise.all(
      result.map(async (item) => {
        const category = item.chargingStation?.org?.category ? item.chargingStation?.org?.category : null;
        return {
          id: item.id,
          createdAt: item.createdAt,
          images: item.images,
          content: item.content,
          stars: item.stars,
          chgs_name: item.chargingStation?.chgs_name,
          chg_charger_id: item.chg_charger_id ? item.chg_charger_id : null,
          chgs_id: item.chgs_id,
          chgs_status: item.chargingStation?.status,
          chgs_station_id: item.chargingStation?.chgs_station_id,
          chgs_address: item.chargingStation?.org?.address ? item.chargingStation?.org?.address : null,
          chgs_operator_manager: item.chargingStation?.operatorManager?.name,
          userId: item.createdBy?.id ? item.createdBy.id : null,
          userName: item.createdBy?.name ? item.createdBy?.name : null,
          accountId: item.createdBy?.accountId ? item.createdBy?.accountId : null,
          userPhone: item.createdBy?.phoneNo ? item.createdBy?.phoneNo : null,
          area: item.chargingStation?.org?.area ? item.chargingStation?.org?.area : null,
          branch: item.chargingStation?.org?.branch ? item.chargingStation?.org?.branch : null,
          areaName: item.chargingStation?.org?.dataValues.areaName
            ? item.chargingStation?.org?.dataValues.areaName
            : null,
          branchName: item.chargingStation?.org?.dataValues.branchName
            ? item.chargingStation?.org?.dataValues.branchName
            : null,
          category: category,
          stat_type: category == 'STT_DIR' ? '직영' : '자영',
          number_of_reports: item?.number_of_reports,
          totalCount: totalCount,
        };
      })
    );
    const count = await await models.Review.count(optionCount);
    _response.json({
      result: resultData,
      averageStars: parseFloat(dataAverage),
      totalCount: totalCount,
      totalData: count,
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

  _response.error.unknown(_error.toString());
  next(_error);
}
