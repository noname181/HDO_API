/**
 * Created by Sarc Bae on 2023-06-28.
 * Code 등록 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const _ = require('lodash');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/codelookup'],
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
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
    if (!body.divCode || !body.divComment) throw 'NO_REQUIRED_INPUT';

    // 이미 존재하는 divCode인지 확인
    const checkExist = await models.CodeLookUp.findOne({
      where: { divCode: body.divCode },
    });
    if (checkExist) throw 'CODE_ALREADY_EXIST';

    // 이미 존재하는 divCodeGroup인지 확인
    const divCodeGroup = await models.CodeLookUp.findAll({
      where: { divCode: body.divCode },
    });
    // divCode가 존재시 sequence는 마지막 sequence의 +1, 없던 divCode인 경우 1부터 다시 넣기
    if (divCodeGroup.length < 1) {
      body.sequence = 1;
    } else {
      body.sequence = _.maxBy(divCodeGroup, 'dataValues.sequence')?.dataValues?.sequence + 1;
    }

    // 전달된 Code 정보를 데이터 베이스에 추가
    const code = await models.CodeLookUp.create(body);

    // 생성된 Config으로 pk로 조회하여 잘 생성되었는지 확인(pk 키 확인 중요!)
    const createdCode = await models.CodeLookUp.findByPk(code.id, {
      include: [],
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 조회된 결과 반환
    _response.json({
      result: createdCode,
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

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(divCode, divComment)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
