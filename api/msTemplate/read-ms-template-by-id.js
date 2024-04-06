/**
 * Message and script template list inquiry and detail inquiry API.
 */

'use strict';
const models = require('../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../middleware/role.middleware');

module.exports = {
  path: ['/ms-template/:id'],
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
   * where inquiry
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

  const id = _request.params.id;

  try {
    const result = await models.CsScript.findByPk(id, {
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    });
    if (!result) throw 'NOT_EXIST';

    return _response.status(HTTP_STATUS_CODE.OK).json({
      result: result,
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

  if (_error === 'NOT_EXIST') {
    _response.error.notFound(_error, '해당 ID에 대한 약관이 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
