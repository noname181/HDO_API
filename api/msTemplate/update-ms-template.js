/**
 * Message and script template update API.
 */

'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/ms-template/:id'],
  method: 'put',
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
   * @param id : match search, "NOT null allowed"
   * @param scrptContent : "null allowed"
   * @param scriptName : "null allowed"
   * @param scriptType : "null allowed"
   * @param scriptComment : "null allowed"
   *
   *
   * updatedAt --> now()
   * updatedWho -->  take user id data in _requset
   * response : success or fail
   */

  const id = _request.params.id;
  const { body } = _request;

  body.updatedWho = _request.user.id;
  body.updatedAt = new Date();

  try {
    const csCript = await models.CsScript.findByPk(id);
    if (!csCript) throw 'NOT_EXIST';

    const updatedCsScript = await csCript.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    return _response.json({
      status: 'success',
      result: updatedCsScript,
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
