'use strict';
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/review'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { ids } = _request.body;
  const listPoint = [];
  try {
    for (const id of ids) {
      const review = await models.Review.findOne({
        where: {
          id: parseInt(id),
        },
      });
      if (!review) {
        return next('INVALID_ID');
      }
      listPoint.push(review);
    }

    await models.Review.update(
      { deletedAt: new Date() },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      },
      { force: true }
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
  const { ids } = _request.body;
  if (!ids || ids.length === 0) {
    return next('NO_REQUIRED_INPUT');
  }
  next();
}

function errorHandler(_error, _request, _response, next) {
  if (_error === 'NO_REQUIRED_INPUT') {
    return _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(ids)');
  }

  if (_error === 'INVALID_ID') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '잘못된 아이디.',
    });
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
