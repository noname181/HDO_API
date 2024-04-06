/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 삭제
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/org/delete-batch'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const orgIds = _request.body.orgIds;

  try {
    if (!orgIds || !Array.isArray(orgIds) || orgIds.length == 0) throw 'NO_REQUIRED_INPUT';

    const userId = _request.user.id; // API 호출자의 user id

    const existMember = await models.UsersNew.count({
      where: {
        type: 'ORG',
        isEmailVerified: true,
        orgId: {
          [Op.in]: orgIds,
        },
      },
    });

    if (existMember) {
      throw 'EXIST_MEMBER';
    }

    await models.Org.update(
      { deletedAt: new Date() },
      {
        where: {
          id: {
            [Op.in]: orgIds,
          },
        },
      },
      { force: false }
    );

    await models.UsersNew.update(
      { status: 'SLEEP', deletedAt: new Date(), roleId: null, dupinfo: null },
      {
        where: {
          type: 'ORG',
          isEmailVerified: false,
          orgId: {
            [Op.in]: orgIds,
          },
        },
      },
      { force: false }
    );

    // 삭제된 충전기 모델 정보 응답
    _response.json({
      status: '200',
      message: 'Success',
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

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(orgIds)');
    return;
  }
  if (_error === 'EXIST_MEMBER') {
    _response.error.notFound(
      _error,
      '회사에 속한 관리자 정보가 있습니다. 관리자를 먼저 삭제 후에 회사정보를 삭제해주세요.'
    );
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
