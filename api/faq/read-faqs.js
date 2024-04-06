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
const { nameMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const Op = sequelize.Op;

module.exports = {
  path: ['/faq'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.MOBILE, USER_TYPE.EXTERNAL, USER_TYPE.HDO],
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

    const search = _request.query.search || null;
    const category = _request.query.category || null;
    const select = _request.query.select ? _request.query.select.toUpperCase() : 'ALL';
    let where = {};
    if (where[Op.and] === undefined) where[Op.and] = [];
    if (search) {
      if (select == 'ALL') {
        where[Op.or] = [{ title: { [Op.like]: '%' + search + '%' } }];
      }
      if (select == 'CATEGORY') {
        if (search.includes('STATION')) {
          where[Op.or] = [];
          where[Op.or].push({ category: 'STT_DIR' });
          where[Op.or].push({ category: 'STT_FRN' });
        } else if (search.includes('CONTRACTOR')) {
          where[Op.or] = [];
          where[Op.or].push({ category: 'CS' });
          where[Op.or].push({ category: 'AS' });
        } else if (search.includes('CLIENT')) {
          where[Op.or] = [];
          where[Op.or].push({ category: 'BIZ' });
          where[Op.or].push({ category: 'ALLNC' });
          where[Op.or].push({ category: 'GRP' });
        } else {
          where[Op.and].push({ category: { [Op.like]: '%' + search + '%' } });
        }
      }
      if (select == 'TITLE') {
        where[Op.and].push({ title: { [Op.like]: '%' + search + '%' } });
      }
    }
    if(category){
      where[Op.and].push({ category: { [Op.like]: '%' + category + '%' } });
    }
    let options = {
      where: where,
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      attributes: [
        'id',
        'title',
        'category',
        'content',
        [
          models.sequelize.literal(
            "(SELECT descInfo FROM CodeLookUps WHERE divCode = 'FAQ_CATEGORY' AND descVal = category LIMIT 1)"
          ),
          'categoryName',
        ],
      ],
      order: [['id', 'DESC']],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
    };

    const { count: totalCount, rows: faqs } = await models.Faq.findAndCountAll(options);
    const faq_ = faqs.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
        createdBy: {
          ...value.createdBy.dataValues,
          name: nameMask(value?.dataValues?.createdBy?.name ?? ''),
        },
      };
    });
    _response.json({
      totalCount: totalCount,
      result: faq_,
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
