/**
 * Created by Sarc Bae on 2023-06-13.
 * 소속 삭제 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/inquiry/:id',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const inquiryId = _request.params.id;
  const force = _request.query.force === 'true'; // Query파라메터로 전달 된 강제 삭제 여부(강제삭제 : row 자체를 삭제. 강제삭제가 아닌경우가 default. 강제삭제가 아닌 경우 deletedAt에 timestamp가 생기면서 조회시 무시됨)

  try {
    // 해당 소속 정보 조회
    const Inquiry = await models.Inquiry.findByPk(inquiryId);
    if (!Inquiry) throw 'NOT_EXIST_INQUIRY';

    // 해당 소속 정보 삭제
    const result = await Inquiry.destroy({
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
    _response.error.notFound(_error, 'cannot find inquiry.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
