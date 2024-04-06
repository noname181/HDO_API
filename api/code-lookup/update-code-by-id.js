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
  path: ['/codelookup/:codeId'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const codeId = _request.params.codeId;
  const body = _request.body; // 수정될 Code 정보
  if (body.id) body.id = undefined; // body에 id가 있으면 제거
  try {
    if (!body.divComment) throw 'NO_REQUIRED_INPUT';
    //해당 id에 대한 Code 정보 조회
    const code = await models.CodeLookUp.findByPk(codeId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!code) throw 'NOT_EXIST_CODE';

    // Check divCode exists
    // const foundCode = await models.CodeLookUp.findOne({
    //   where: {
    //     [Op.and]: [
    //       {
    //         divCode: body.divCode,
    //       },
    //       {
    //         id: {
    //           [Op.ne]: codeId,
    //         },
    //       },
    //     ],
    //   },
    // });
    // if (foundCode) throw 'CODE_ALREADY_EXIST';

    await code.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 업데이트된 Code 정보 새로고침
    const reloadCode = await code.reload({
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

  if (_error === 'CODE_ALREADY_EXIST') {
    _response.error.badRequest(_error, '해당 divCode 대한 CodeLookUp값이 이미 존재합니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CODE') {
    _response.error.notFound(_error, '해당 ID에 대한 Code가 존재하지 않습니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(divCode, divComment, descVal, descInfo)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
