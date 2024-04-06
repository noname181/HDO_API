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
  path: ['/codelookup'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const listDivCode = _request.body.listDivCode;
  console.log({ listDivCode });

  try {
    if (!listDivCode || !Array.isArray(listDivCode) || listDivCode.length == 0) throw 'NO_REQUIRED_INPUT';

    for (let divCode of listDivCode) {
      const { count, rows: codes } = await models.CodeLookUp.findAndCountAll({
        where: {
          divCode,
          deletedAt: null,
        },
      });
      if (count > 1) {
        throw 'ALREADY_EXISTS_SUB_CODE';
      }
      if (count === 0) throw 'NOT_EXIST_CODE';
    }

    await models.CodeLookUp.update(
      { deletedAt: new Date() },
      {
        where: {
          divCode: {
            [Op.in]: listDivCode,
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

  if (_error === 'NOT_EXIST_CODE') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  if (_error === 'ALREADY_EXISTS_SUB_CODE') {
    _response.error.notFound(_error, '구분코드에 귀속된 코드값이 있어, 구분코드를 삭제할수 없습니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(listDivCode)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
