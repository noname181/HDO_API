const { PasswordService } = require('../../../../util/passwordService');
const { USER_TYPE } = require('../../../../util/tokenService');
const models = require('../../../../models');
const { configuration } = require('../../../../config/config');

const changePassword = {
  path: '/web/auth/change-password',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const config = configuration();
  try {
    const { old_password, new_password, confirm_password } = request.body;

    if (!old_password || !new_password || !confirm_password) {
      return next('NO_REQUIRED_INPUT');
    }

    if (new_password.trim() !== confirm_password.trim()) {
      return next('NEW_PASSWORD_AND_CONFIRM_NOT_MATCH');
    }

    const { user: authUser } = request;
    const user = await models.UsersNew.findOne({
      where: { id: authUser.id },
    });

    if (!user) {
      return next('USER_IS_NOT_FOUND');
    }

    const passwordService = new PasswordService(config);
    const isMatchPassword = await passwordService.compare(old_password, user.hashPassword);

    if (!isMatchPassword) {
      return next('PASSWORD_NOT_MATCH');
    }

    const { salt, passwordHashed } = await passwordService.hash(new_password);
    await models.UsersNew.update(
      { saltRounds: salt, hashPassword: passwordHashed },
      {
        where: {
          id: user.id,
        },
      }
    );

    response.json({
      status: '200',
      message: '비밀번호가 변경되었습니다.',
    });
  } catch (error) {
    next(error);
  }
}

async function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  console.log('error::', error);
  if (error === 'USER_IS_NOT_FOUND') {
    return response.error.notFound(error, '해당 회원의 데이터가 존재하지 않습니다.');
  }

  if (error === 'NEW_PASSWORD_AND_CONFIRM_NOT_MATCH') {
    return response.error.notFound(error, '입력하신 새 비밀번호 값이 다릅니다. 확인 후 다시 입력해주세요.');
  }

  if (error === 'PASSWORD_NOT_MATCH') {
    return response.error.badRequest(error, '기존 비밀번호가 다릅니다. 확인 후 다시 입력해주세요');
  }

  if (error === 'NO_REQUIRED_INPUT') {
    response.error.notFound(error, '필수 입력 정보가 누락되었습니다.');
    return;
  }

  next();
}

module.exports = { changePassword };
