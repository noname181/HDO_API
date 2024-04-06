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
  path: ['/subcodelookup/delete-batch'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const subCodeIds = _request.body.subCodeIds;

  try {
    if (!subCodeIds || !Array.isArray(subCodeIds) || subCodeIds.length == 0) throw 'NO_REQUIRED_INPUT';

    await models.CodeLookUp.update(
      { deletedAt: new Date() },
      {
        where: {
          id: {
            [Op.in]: subCodeIds,
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
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(subCodeIds)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
