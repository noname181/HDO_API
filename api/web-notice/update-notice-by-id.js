'use strict';
const models = require('../../models');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/web/notice/:noticeId'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const noticeId = _request.params.noticeId;

  body.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;

  const transaction = await models.sequelize.transaction();
  try {
    const notice = await models.WebNotice.findByPk(noticeId);
    if (!notice) throw 'NOT_EXIST_NOTICE';

    if(body.type) body.type = body.type.toUpperCase();
    
    await notice.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 수정된 충전기 모델 리로딩
    const updatedNotice = await models.WebNotice.findByPk(noticeId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    await transaction.commit();

    _response.json({
      status: '200',
      result: updatedNotice,
    });
  } catch (e) {
    await transaction.rollback();
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_NOTICE') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
