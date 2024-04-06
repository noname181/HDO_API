'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/file-to-update/:updateFileId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const updateFileId = _request.params.updateFileId;

  body.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub;
  body.updatedWho = userId;
  body.division = body.division?.toUpperCase();

  try {
    const fileUpdate = await models.FileToCharger.findByPk(updateFileId);
    if (!fileUpdate) throw 'NOT_EXIST_FILE_MODEL';

    if (fileUpdate.newestVersion && !body.newestVersion) throw 'CANNOT_UPDATE';

    if (!fileUpdate.newestVersion && body.newestVersion) {
      if (body.newestVersion) {
        await models.FileToCharger.update(
          {
            newestVersion: false,
          },
          {
            where: {
              division: body.division,
            },
          }
        );
      }
    }

    await fileUpdate.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    const result = await models.FileToCharger.findByPk(updateFileId, {
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

  if (_error === 'NOT_EXIST_FILE_MODEL') {
    _response.error.notFound(_error, 'cannot find File');
    return;
  }

  if (_error === 'CANNOT_UPDATE') {
    _response.error.notFound(_error, '최소 한개 이상의 최신버전이 필요합니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
