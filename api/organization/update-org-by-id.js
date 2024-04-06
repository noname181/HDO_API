/**
 * Created by Sarc Bae on 2023-06-13.
 * 소속 수정 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/orgs/:orgId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const orgId = _request.params.orgId;
  const body = await _request.body; // 수정될 소속 정보
  if (body.id) body.id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;

  try {
    // 해당 id에 대한 소속 정보 조회
    const org = await models.Org.findByPk(orgId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!org) throw 'NOT_EXIST_ORG';

    if (org.haveCarWash === 'Y' && body.haveCarWash === 'N') {
      // haveCarWash가 Y->N 일때 소속된 충전소들에서도 수정
      await models.sb_charging_station.update(
        { chgs_car_wash_yn: 'N' },
        {
          where: { orgId: orgId },
        }
      );
    }

    // 전달된 body로 업데이트
    await org.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 업데이트된 소속 정보 새로고침
    const reloadOrg = await org.reload({
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });

    // 수정된 정보 응답
    _response.json({
      result: reloadOrg,
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

  if (_error === 'NOT_EXIST_ORG') {
    _response.error.notFound(_error, '해당 ID에 대한 소속이 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
