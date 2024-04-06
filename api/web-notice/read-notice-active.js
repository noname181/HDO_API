'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const moment = require('moment');

const {
  nameMask,
  userIdMask,
  emailMask,
  phoneNoMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const Op = sequelize.Op;

module.exports = {
  path: ['/web/active/notice'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
    const currentHour = moment().tz('Asia/Seoul').format();
    const type = _request.query.type ? _request.query.type.toUpperCase() : '';

    let options = {
      where: {
        isActive: 'Y',
        type: type ? type : 'WEB',
        firstDate: { [Op.lte]: currentHour },
        lastDate: { [Op.gte]: currentHour },
      },
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
