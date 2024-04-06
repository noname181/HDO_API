/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const Sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = Sequelize.Op;

module.exports = {
  path: '/inquiry/:id',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const inquiryId = _request.params.id;

  // Querying 옵션1 - 언어 전체 조회
  const option = {
    include: [
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
    exclude: ['createdWho', 'updatedWho', 'deletedAt'],
  };

  try {
    if (!inquiryId) throw 'NO_INQUIRY_ID';

    const result = await models.Inquiry.findByPk(inquiryId, option);
    if (!result) throw 'NOT_EXIST_INQUIY';

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

  if (_error === 'NO_INQUIRY_ID') {
    _response.error.notFound(_error, 'Id inquiry invalid.');
    return;
  }

  if (_error === 'NOT_EXIST_INQUIY') {
    _response.error.notFound(_error, 'cannot find inquiry');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
