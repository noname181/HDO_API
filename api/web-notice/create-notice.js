/**
 * Created by inju on 2023-06-05.
 * Refactored by Jackie Yoon on 2023-07-25.
 * 충전기 모델 생성
 */
'use strict';
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/web/notice'],
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;

  const userId = _request.user.id;
  body.createdWho = userId;
  body.updatedWho = userId;
  body.userId = userId;

  if(body.type) body.type = body.type.toUpperCase();

  try {
    const notice = await models.WebNotice.create(body);
    notice.save();

    _response.json({
      result: notice,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  const { firstDate, lastDate } = _request.body;
  if (firstDate && lastDate && Date.parse(firstDate) > Date.parse(lastDate)) throw 'INVALID_TIME';
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'INVALID_TIME') {
    _response.error.badRequest(_error, '잘못된 시간.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
