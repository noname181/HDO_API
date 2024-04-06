'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/file-to-update/:fileId',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const fileId = _request.params.fileId;
  if (!fileId) throw 'NOT_EXIST_FILE_MODEL';

  const option = {
    include: [
      // User 테이블의 경우
      {
        model: models.UsersNew,
        as: 'createdBy',
        attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
      },
      {
        model: models.UsersNew,
        as: 'updatedBy',
        attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
      },
    ],
    exclude: ['createdWho', 'updatedWho', 'deletedAt'],
  };

  try {
    const foundFile = await models.FileToCharger.findByPk(fileId, option);
    if (!foundFile) throw 'NOT_EXIST_FILE_MODEL';

    _response.json({
      result: foundFile,
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

  if (_error === 'RETRIEVE_CONFIG_FAILED') {
    _response.error.notFound(_error, '설정(CONFIG)값 조회에 실패하였습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_FILE_MODEL') {
    _response.error.notFound(_error, 'cannot find File');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
