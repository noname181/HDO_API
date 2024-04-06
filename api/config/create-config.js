/**
 * Created by Sarc Bae on 2023-06-21.
 * Config 등록 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/config'],
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
    if (!body.divCode || !body.divComment || !body.cfgVal) throw 'NO_REQUIRED_INPUT';

    // 이미 존재하는 divCode인지 확인
    const checkExist = await models.Config.findOne({
      where: { divCode: body.divCode },
    });
    if (checkExist) throw 'CONFIG_ALREADY_EXIST';

    // 전달된 Config 정보를 데이터 베이스에 추가
    const config = await models.Config.create(body);

    // 생성된 Config으로 pk로 조회하여 잘 생성되었는지 확인(pk 키 확인 중요!)
    const createdConfig = await models.Config.findByPk(config.id, {
      include: [],
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 조회된 결과 반환
    _response.json({
      result: createdConfig,
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

  if (_error === 'CONFIG_ALREADY_EXIST') {
    _response.error.badRequest(_error, '해당 divCode에 대한 Config값이 이미 존재합니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(divCode, divComment, cfgVal)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
