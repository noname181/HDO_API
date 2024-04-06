'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const { USER_ACTION_TYPE } = require('../../interfaces/userAction.interface');

module.exports = {
  path: ['/report-user'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const transaction = await models.sequelize.transaction();
  try {
    const { body } = _request;
    body.createdAt = body.updatedAt = new Date();

    if (!body.reported_user) throw 'NO_REQUIRED_INPUT';

    if (!body.user_request) {
      body.user_request = _request.user.id;
      body.createdWho = _request.user.id;
      body.updatedWho = _request.user.id;
    } else {
      body.createdWho = body.user_request;
      body.updatedWho = body.user_request;
    }

    if (body.user_request === body.reported_user) throw 'CONFLICT';

    const foundUser = await models.UsersNew.findByPk(body.reported_user);
    if (!foundUser) throw 'USER_NOT_FOUND';

    await foundUser.update(
      {
        number_of_reports: foundUser.number_of_reports + 1,
      },
      { transaction }
    );

    body.action = USER_ACTION_TYPE.REPORT_USER;
    const result = await models.UserBlock.create(body);
    result.save();

    await transaction.commit();
    _response.json({
      result,
    });
  } catch (e) {
    await transaction.rollback();
    next(e);
  }
}

async function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'CONFLICT') {
    _response.error.badRequest(_error, '본인이 작성한 리뷰를 신고할 수 없습니다.');
    return;
  }

  if (_error === 'USER_NOT_FOUND') {
    _response.error.badRequest(_error, '사용자를 찾을 수 없습니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(reported_user)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
