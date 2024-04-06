'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const moment = require('moment');
const _ = require('lodash');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/terms/:termId'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const termId = _request.params.termId;
  const body = await _request.body;
  if (body.id) body.id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedAt = new Date();
  body.updatedWho = userId;

  try {
    const term = await models.Terms.findByPk(termId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!term) throw 'NOT_EXIST_TERMS';

    //Create a new version of the term
    const nowHour = moment().tz('Asia/Seoul').format();
    let payload = _.cloneDeep(term.dataValues);
    payload.version = nowHour;
    payload = { ...payload, ...body };
    delete payload.id;

    const result = await models.Terms.create(payload);

    _response.json({
      status: '200',
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

  if (_error === 'NOT_EXIST_TERMS') {
    _response.error.notFound(_error, '해당 ID에 대한 약관이 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
