'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');

const _ = require('lodash');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/userslog-list/:logId'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const logId = _request.params.logId;
  const body = await _request.body;
  if (body.id) body.id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedAt = new Date();
  body.updatedWho = userId;

  try {
    const log = await models.UserLogs.findByPk(logId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!log) throw 'NOT_EXIST_LOG';

    await log.update(body, {
        attributes: {
          exclude: ['deletedAt'],
        },
    });
  
    const updatedLog = await models.UserLogs.findByPk(logId, {
        attributes: {
          exclude: ['deletedAt'],
        },
      });

    _response.json({
      status: '200',
      result: updatedLog,
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

  if (_error === 'NOT_EXIST_LOG') {
    _response.error.notFound(_error, 'NOT_EXIST_LOG');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
