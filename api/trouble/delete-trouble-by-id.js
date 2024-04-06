/**
 * Created by Sarc Bae on 2023-06-13.
 * 소속 삭제 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/trouble/:troubleId',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.delete],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const troubleId = _request.params.troubleId;
  const force = _request.query.force === 'true';
  try {
    // 해당 소속 정보 조회
    const trouble = await models.TroubleReport.findByPk(troubleId);
    if (!trouble) throw 'NOT_EXIST_TROUBLE';

    // 해당 소속 정보 삭제
    const troubledelete = await trouble.destroy({
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
      force: force,
    });

    // 삭제된 소속 정보 응답
    _response.json({
      result: troubledelete,
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
  if (_error === 'NOT_EXIST_TROUBLE') {
    _response.error.notFound(_error, '해당 ID에 대한 Trouble 존재하지 않습니다.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
