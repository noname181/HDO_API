'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/review'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.createdAt = body.updatedAt = new Date();

  const userId = _request.user.id || _request.user.sub;
  body.createdWho = userId;
  body.updatedWho = userId;

  try {
    if (!body.chgs_id || !body.content || !body.stars) throw 'NO_REQUIRED_INPUT';
    if (body.images && body.images.length > 5) throw 'INPUT_LENGTH';
    const result = await models.Review.create(body);
    result.save();

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
  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(chaging Station,content,stars)');
    return;
  }
  if (_error === 'INPUT_LENGTH') {
    _response.error.notFound(_error, 'Maximum 5 photos only');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
