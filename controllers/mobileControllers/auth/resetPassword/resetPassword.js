const { PasswordService } = require('../../../../util/passwordService');
const { configuration } = require('../../../../config/config');
const models = require('../../../../models');
const { USER_ROLE } = require('../../../../middleware/role.middleware');
const { HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');
const { passwordValidator, emailValidator } = require('../../../../util/validators');
const { Op } = require('sequelize');

const resetPassword = {
  path: '/auth/password/reset',
  method: 'post',
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { body } = request;

  const user = await models.UsersNew.findOne({
    where: {
      type: 'ORG',
      status: 'ACTIVE',
      [Op.or]: [
        {
          email: body.email,
        },
        {
          accountId: body.email,
        },
      ],
    },
  });

  if (!user) {
    return next('USER_IS_NOT_EXISTS');
  }

  if (body.token !== user.resetPasswordToken) {
    return next('TOKEN_INCORRECT');
  }

  const config = configuration();
  const passwordService = new PasswordService(config);
  const { salt, passwordHashed } = await passwordService.hash(body.password);
  await models.UsersNew.update(
    {
      saltRounds: salt,
      hashPassword: passwordHashed,
      isEmailVerified: true,
      resetPasswordToken: null,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  return response.status(HTTP_STATUS_CODE.NO_CONTENT).json({});
}

function validator(request, response, next) {
  const { body } = request;

  if (!body) {
    throw 'INVALID_PAYLOAD';
  }

  if (!body.token) {
    throw 'TOKEN_IS_EMPTY';
  }

  if (!body.email || !emailValidator(body.email)) {
    throw 'INVALID_EMAIL';
  }

  if (!body.password || !passwordValidator(body.password)) {
    throw 'INVALID_PASSWORD';
  }

  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'INVALID_PAYLOAD') {
    return response.error.badRequest(error, '계정 Id가 존재합니다.');
  }

  if (error === 'TOKEN_IS_EMPTY') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '토큰이 비어 있습니다.',
    });
  }

  if (error === 'INVALID_EMAIL') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 사용중인 이메일입니다.',
    });
  }

  if (error === 'INVALID_PASSWORD') {
    return response.error.badRequest(error, '영문,숫자,특수문자 조합으로 입력해주세요.');
  }

  if (error === 'USER_IS_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '회원이 없습니다.',
    });
  }

  if (error === 'TOKEN_INCORRECT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '토큰이 잘못되었습니다.',
    });
  }

  next();
}

module.exports = { resetPassword };
