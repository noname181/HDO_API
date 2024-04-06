'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { USER_ACTION_TYPE } = require('../../interfaces/userAction.interface');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/report-review'],
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

    if (!body.user_request) {
      body.user_request = _request.user.id;
      body.createdWho = _request.user.id;
      body.updatedWho = _request.user.id;
    } else {
      body.createdWho = body.user_request;
      body.updatedWho = body.user_request;
    }

    const foundReview = await models.Review.findByPk(body.review_id);

    if (!foundReview) throw 'REVIEW_NOT_FOUND';
    if (foundReview.createdWho === body.user_request) throw 'CONFLICT';

    await foundReview.update(
      {
        number_of_reports: foundReview.number_of_reports + 1
      },
      { transaction }
    );

    body.action = USER_ACTION_TYPE.REPORT_REVIEW;
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
    _response.error.badRequest(_error, '충전기가 이용가능하지 않습니다.');
    return;
  }

  if (_error === 'REVIEW_NOT_FOUND') {
    _response.error.badRequest(_error, '충전기가 이용가능하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
