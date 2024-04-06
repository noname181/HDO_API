/**
 * Created by Sarc Bae on 2023-08-07.
 * 업로드 파일 삭제 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/file-to-update/:fileId',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const fileId = _request.params.fileId;
  const force = _request.query.force === 'true'; // Query파라메터로 전달 된 강제 삭제 여부(강제삭제 : row 자체를 삭제. 강제삭제가 아닌경우가 default. 강제삭제가 아닌 경우 deletedAt에 timestamp가 생기면서 조회시 무시됨)

  try {
    // 해당 정보 조회
    const file = await models.FileToCharger.findByPk(fileId);
    if (!file) throw 'NOT_EXIST_FILE';

    if (file.newestVersion) {
      if (fileUpdate.newestVersion && !body.newestVersion) throw 'CANNOT_DELETE';
    }

    // 해당 정보 삭제
    const deletedFile = await file.destroy({
      attributes: {
        exclude: ['deletedAt'],
      },
      force: force,
    });

    // 삭제된 정보 응답
    _response.json({
      result: deletedFile,
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

  if (_error === 'NOT_EXIST_FILE') {
    _response.error.notFound(_error, '해당 ID에 대한 파일이 존재하지 않습니다.');
    return;
  }

  if (_error === 'INVALID_ID') {
    _response.error.notFound(_error, '잘못된 아이디.');
    return;
  }

  if (_error === 'CANNOT_DELETE') {
    _response.error.notFound(_error, '최소 한개 이상의 최신버전이 필요합니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
