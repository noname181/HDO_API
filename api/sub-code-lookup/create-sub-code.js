/**
 * Created by Sarc Bae on 2023-06-28.
 * Code 등록 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const _ = require('lodash');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/subcodelookup'],
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.updatedAt = new Date(); // updatedAt의 default 값을 sequelize에서 데이터 생성시 호출하지 못하여 수동으로 추가

  // pk는 자동생성이므로, body에 pk가 전달되는 경우 제거
  if (body.id) body.id = undefined;

  try {
    // 필수값 정의(자동으로 만들어지는 pk 제외)
    const { codeId, descVal, descInfo } = body;
    if (!codeId || !descVal || !descInfo) throw 'NO_REQUIRED_INPUT';

    const foundCode = await models.CodeLookUp.findByPk(codeId);
    if (!foundCode) throw 'NOT_EXIST_CODE';

    const checkExist = await models.CodeLookUp.findOne({
      where: {
        divCode: {
          [Op.eq]: foundCode.divCode,
        },
        descVal: {
          [Op.eq]: body.descVal,
          [Op.ne]: '',
        },
        descInfo: {
          [Op.eq]: body.descInfo,
          [Op.ne]: '',
        },
        isSubCode: true,
      },
    });

    if (checkExist) throw 'CODE_ALREADY_EXIST';

    body.divCode = foundCode.divCode;
    body.divComment = foundCode.divComment;
    body.isSubCode = true;

    // 전달된 Code 정보를 데이터 베이스에 추가
    const code = await models.CodeLookUp.create(body);

    // 조회된 결과 반환
    _response.json({
      result: code,
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

  if (_error === 'CODE_ALREADY_EXIST') {
    _response.error.badRequest(_error, '해당 divCode-divComment에 대한 SubCodeLookUp값이 이미 존재합니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(codeId, descVal , descInfo)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
