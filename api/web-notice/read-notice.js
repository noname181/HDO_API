'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const {
  nameMask,
  userIdMask,
  emailMask,
  phoneNoMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const Op = sequelize.Op;

module.exports = {
  path: ['/web/notice'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const title = _request.query.title || null;
    const active = _request.query.active || null;
    const firstDate = _request.query.firstDate || null;
    const lastDate = _request.query.lastDate || null;
    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
    const type = _request.query.type ? _request.query.type.toUpperCase() : '';

    let where = {
      [Op.and]: [],
    };

    if (title) {
      where[Op.and].push({ title: { [Op.like]: '%' + title + '%' } });
    }

    if (type) {
      where[Op.and].push({ type: type.toUpperCase() });
    }

    if (active) {
      where[Op.and].push({ isActive: active });
    }

    if (firstDate && !lastDate) {
      where[Op.and].push({
        [Op.or]: [
          { firstDate: { [Op.gte]: new Date(firstDate).setHours(0, 0, 0, 0) } },
          {
            firstDate: { [Op.lte]: new Date(firstDate).setHours(0, 0, 0, 0) },
            lastDate: { [Op.gte]: new Date(firstDate).setHours(0, 0, 0, 0) },
          },
        ],
      });
    }

    if (lastDate && !firstDate) {
      where[Op.and].push({
        [Op.or]: [
          { lastDate: { [Op.lte]: new Date(lastDate).setHours(23, 59, 59, 999) } },
          {
            firstDate: { [Op.lte]: new Date(lastDate).setHours(23, 59, 59, 999) },
            lastDate: { [Op.gte]: new Date(lastDate).setHours(23, 59, 59, 999) },
          },
        ],
      });
    }

    if (firstDate && lastDate) {
      where[Op.and].push({
        [Op.or]: [
          {
            firstDate: { [Op.gte]: new Date(firstDate).setHours(0, 0, 0, 0) },
            lastDate: { [Op.lte]: new Date(lastDate).setHours(23, 59, 59, 999) },
          },
          {
            firstDate: { [Op.lte]: new Date(firstDate).setHours(0, 0, 0, 0) },
            lastDate: { [Op.gte]: new Date(firstDate).setHours(0, 0, 0, 0) },
          },
          {
            firstDate: { [Op.lte]: new Date(lastDate).setHours(23, 59, 59, 999) },
            lastDate: { [Op.gte]: new Date(lastDate).setHours(23, 59, 59, 999) },
          },
        ],
      });
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
      order: [['createdAt', orderByQueryParam]],
    };

    const { count: totalCount, rows: notices } = await models.WebNotice.findAndCountAll(options);

    const notice_ = notices.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
        createdBy: {
          id: value?.createdBy?.id || null,
          orgId: value?.createdBy?.orgId || null,
          status: value?.createdBy?.status || null,
          name: nameMask(value?.createdBy?.name ?? ''),
          accountId: userIdMask(value?.createdBy?.accountId ?? ''),
          email: emailMask(value?.createdBy?.email ?? ''),
          phoneNo: phoneNoMask(value?.createdBy?.phoneNo ?? ''),
        },
      };
    });

    _response.json({ totalCount: totalCount, result: notice_ });
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
