/**
 * Created by Sarc Bae on 2023-06-28.
 * CodeLookup 수정 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/subcodelookup/:subCodeId'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const subCodeId = _request.params.subCodeId;
    const { body } = _request;
    if (!subCodeId) throw 'NOT_VALID_REQUEST';
    if (!body.descInfo) throw 'NO_REQUIRED_INPUT';

    const code = await models.CodeLookUp.findByPk(subCodeId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!code) throw 'NOT_EXIST_CODE';

    const checkExist = await models.CodeLookUp.findOne({
      where: {
        descInfo: body.descInfo,
        divCode: code.divCode,
        id: {
          [Op.ne]: subCodeId,
        },
      },
    });
    if (checkExist) throw 'CODE_ALREADY_EXIST';

    // 전달된 body로 업데이트
    await code.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 업데이트된 Code 정보 새로고침
    const reloadCode = await code.reload({
      include: [],
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 수정된 정보 응답
    _response.json({
      result: reloadCode,
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

  if (_error === 'NOT_EXIST_CODE') {
    _response.error.notFound(_error, '해당 ID에 대한 Code가 존재하지 않습니다.');
    return;
  }

  if (_error === 'NOT_VALID_REQUEST') {
    _response.error.badRequest(_error, '올바른 요청이 아닙니다.');
    return;
  }

  if (_error === 'CODE_ALREADY_EXIST') {
    _response.error.badRequest(_error, '해당 divCode-descInfo에 대한 CodeLookUp값이 이미 존재합니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(descVal , descInfo)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
