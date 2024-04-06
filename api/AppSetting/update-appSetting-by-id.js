'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/appSetting/:appId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const appSettingId = _request.params.appId;

  body.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;

  try {
    const appSetting = await models.AppSetting.findByPk(appSettingId);
    if (!appSetting) throw 'NOT_EXIST_APPSETTING_MODEL';
    await appSetting.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    const result = await models.AppSetting.findByPk(appSettingId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    _response.json({
      status: '200',
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

  if (_error === 'NOT_EXIST_APPSETTING_MODEL') {
    _response.error.notFound(_error, 'cannot find appsetting');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
