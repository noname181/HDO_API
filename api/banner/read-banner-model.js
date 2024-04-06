/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const moment = require('moment');
const { nameMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/banner'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const searchTitle = _request.query.title || null;
    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
    const startDate = _request.query.startDate || null;
    const endDate = _request.query.endDate || null;
    const dateToday = _request.query.dateToday || null;
    const option = _request.query.option || null;
    const validBanner = _request.query.validBanner || null;
    let where = { deletedAt: null };
    if (where[Op.and] === undefined) where[Op.and] = [];
    if (searchTitle) {
      where[Op.and].push({ title: { [Op.like]: '%' + searchTitle + '%' } });
    }
    if (option) {
      where[Op.and].push({ option: option });
    }
    if (startDate || endDate) {
      const dateCondition = {};

      if (startDate) {
        dateCondition.startdate = { [Op.gte]: startDate };
      }

      if (endDate) {
        dateCondition.enddate = { [Op.lte]: endDate };
      }

      where[Op.and].push(dateCondition);
    }
    if (dateToday) {
      where[Op.and].push({
        [Op.and]: [
          {
            startdate: { [Op.gte]: `${dateToday} 00:00:00` },
          },
          {
            enddate: { [Op.lte]: `${dateToday} 23:59:59:999` },
          },
        ],
      });
    }
    if (validBanner) {
      where[Op.and].push({
        enddate: { [Op.gte]: moment().tz('Asia/Seoul').format() },
      });
    }
    const queryOptions = {
      where: where,
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
      order: [['createdAt', orderByQueryParam]],
    };

    const banner = await models.BannerModel.findAll(queryOptions);
    const totalCount = banner.length;

    const banner_ = banner.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
        createdBy: {
          ...value.createdBy,
          name: nameMask(value?.createdBy?.name ?? ''),
        },
      };
    });

    _response.json({ totalCount: totalCount, result: banner_ });
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
