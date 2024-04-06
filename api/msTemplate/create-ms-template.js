/**
 * create message and script templates.
 */

'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/ms-template'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: true,
  validator: validator,
  service: service,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  /**
   * TODO CsScript Table data create
   * where option
   * @param scrptContent
   * @param scriptName
   * @param scriptType
   * @param scriptComment
   *
   * insert into CsScripts id, scrptContent, scriptName, scriptType, scriptComment Values (...)
   *
   * createdAt, updatedAt --> now()
   * createdWho, updatedWho -->  take user id data in _requset
   *
   * response : success or fail
   */
  try {
    const body = _request.body;
    body.createdWho = _request.user.id;
    body.updatedWho = _request.user.id;
    const csScripts = await models.CsScript.create(body);
    csScripts.save();

    return _response.json({
      status: 'success',
      result: csScripts,
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
