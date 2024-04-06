'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const _ = require('lodash');
const { nameMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');
// const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');

module.exports = {
  path: ['/terms'],
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
    const select = _request.query.select ? _request.query.select.toUpperCase() : 'ALL';
    let where = {
      [Op.and]: [
        {
          parentId: {
            [Op.is]: null,
          },
        },
      ],
    };

    if (search) {
      if (select == 'ALL') {
        where[Op.or] = [{ category: { [Op.like]: '%' + search + '%' } }, { title: { [Op.like]: '%' + search + '%' } }];
      }
      if (select == 'CATEGORY') {
        // 추후 Value를 어떻게 저장하느냐에 따라 검색로직 바뀜.
        // JOIN or PAYMENT 라고 가정.
        if (search.includes('JOIN')) {
          where[Op.or] = [];
          where[Op.or].push({ category: 'JOIN' });
        } else if (search.includes('PAYMENT')) {
          where[Op.or] = [];
          where[Op.or].push({ category: 'PAYMENT' });
        } else {
          where[Op.and].push({ category: { [Op.like]: '%' + search + '%' } });
        }
      }
      if (select == 'TITLE') {
        where[Op.and].push({ title: { [Op.like]: '%' + search + '%' } });
      }
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
      order: [['id', 'DESC']],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
    };

    const { count: totalCount, rows: terms } = await models.Terms.findAndCountAll(options);

    const result = await Promise.all(
      terms.map(async (item) => {
        const childs = await models.Terms.findAll({
          where: {
            [Op.or]: [{ parentId: item.dataValues.id }, { id: item.dataValues.id }],
          },
          order: [['id', 'DESC']],
        });

        return {
          ...item.dataValues,
          childs,
          createdBy: {
            ...item?.createdBy,
            name: nameMask(item?.createdBy?.name),
          },
        };
      })
    );

    // let result = _.cloneDeep(terms);
    // for (const item of result) {
    //   //console.log('item ---->', item)
    //   item.dataValues.childs =
    //     (await models.Terms.findAll({
    //       where: {
    //         [Op.or]: [{ parentId: item.dataValues.id }, { id: item.dataValues.id }],
    //       },
    //     })) || [];
    //   item.createdBy = {
    //     ...item.createdBy,
    //     name: nameMask()
    //   }
    // }

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
