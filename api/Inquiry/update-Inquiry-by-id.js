/**
 * Created by Sarc Bae on 2023-06-13.
 * 소속 수정 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/inquiry/:id',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const inquiryId = _request.params.id;
  const body = await _request.body; // 수정될 소속 정보
  if (body.id) body.id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;
  if (body.comment) {
    body.status = true;
  }

  try {
    const Inquiry = await models.Inquiry.findByPk(inquiryId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!Inquiry) throw 'NOT_EXIST_INQUIRY';

    // 전달된 body로 업데이트
    const updatedFaq = await Inquiry.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 업데이트된 소속 정보 새로고침
    const result = await Inquiry.reload({
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

  if (_error === 'NOT_EXIST_INQUIRY') {
    _response.error.notFound(_error, 'cannot find inquiry');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
