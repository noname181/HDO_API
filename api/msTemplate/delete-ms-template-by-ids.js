/**
 * Delete message and script templates.
 */

'use strict';
const models = require('../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/ms-template/delete-batch'],
  method: 'delete',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: true,
  validator: validator,
  service: service,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  /**
   * TODO CsScript Table data Delete
   * where option
   * @param ids : match search, "NOT null allowed
   *
   * response : success or fail
   */
  const { ids } = _request.body;

  const listCsScript = [];
  for (let id of ids) {
    let csScript = await models.CsScript.findByPk(id);
    if (!csScript) throw 'NOT_EXIST';
    listCsScript.push(csScript.dataValues);
  }

  await models.CsScript.update(
    { deletedAt: new Date() },
    {
      where: {
        id: { [Op.in]: ids },
      },
    },
    { force: false }
  );

  return _response.json({ status: 'success' });
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
