/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { nameMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/inquiry'],
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
    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;

    const content = _request.query.content || null;
    const title = _request.query.title || null;
    let where = {};
    if (where[Op.and] === undefined) where[Op.and] = [];
    if (content) {
      where[Op.and].push({ content: { [Op.like]: '%' + content + '%' } });
    }
    if (title) {
      where[Op.and].push({ title: { [Op.like]: '%' + title + '%' } });
    }
    if (_request.query.status !== undefined) {
      const status = _request.query.status === 'true';
      where[Op.and].push({ status: status });
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
      order: [['id', 'DESC']],
    };

    const { count: totalCount, rows: Inquirys } = await models.Inquiry.findAndCountAll(options);
    const result = Inquirys.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
        createdBy: {
          ...value.createdBy,
          name: nameMask(value?.createdBy?.name ?? ''),
        },
      };
    });
    _response.json({
      totalCount: totalCount,
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
