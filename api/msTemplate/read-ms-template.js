/**
 * Message and script template list inquiry and detail inquiry API.
 */

'use strict';
const models = require('../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../middleware/role.middleware');

module.exports = {
  path: ['/ms-template'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: true,
  validator: validator,
  service: service,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  /**
   * TODO CsScript Table inquiry
   * where option
   * @param id : match search, "null allowed
   * @param scriptType : match search ('COM' or 'MES'), "null allowed
   * @param scptContent : Like search, "null allowed
   * @param scriptComment : Like search, "null allowed
   *
   * response : all colume
   *
   * if have param id in url : detail inquiry
   * else detail inquiry
   */
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 20;
  const odby = _request.query.odby ? _request.query.odby.toUpperCase() : 'DESC';

  const searchKey = _request.query.searchKey ? _request.query.searchKey.trim() : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal.trim() : '';
  const category = _request.query.category ? _request.query.category.trim() : '';
  const type = _request.query.type ? _request.query.type.trim() : '';

  const SEARCH_KEY = {
    ID: 'id',
    SCRIPT_TYPE: 'scriptType',
    SCRIPT_CONTENT: 'scrptContent',
    SCRIPT_COMMENT: 'scriptComment',
  };

  const where = {
    [Op.and]: [],
  };

  try {
    switch (searchKey) {
      case SEARCH_KEY.ID:
        where[Op.and].push({
          id: searchVal,
        });
        break;
      case SEARCH_KEY.SCRIPT_CONTENT:
        where[Op.and].push({
          scrptContent: { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      case SEARCH_KEY.SCRIPT_COMMENT:
        where[Op.and].push({
          scriptComment: { [Op.like]: '%' + searchVal + '%' },
        });
        break;
      default:
        if (searchVal) {
          where[Op.and].push({
            [Op.or]: [
              { id: searchVal },
              { scrptContent: { [Op.like]: '%' + searchVal + '%' } },
              { scriptComment: { [Op.like]: '%' + searchVal + '%' } },
            ],
          });
        }
        break;
    }

    if (category) {
      where[Op.and].push({
        scriptCategory: { [Op.like]: '%' + category + '%' },
      });
    }
    if (type) {
      where[Op.and].push({
        scriptType: { [Op.like]: '%' + type + '%' },
      });
    }

    const { count: totalCount, rows: msTemplates } = await models.CsScript.findAndCountAll({
      where,
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      order: [['id', odby]],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
    });

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount,
      result: msTemplates,
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
