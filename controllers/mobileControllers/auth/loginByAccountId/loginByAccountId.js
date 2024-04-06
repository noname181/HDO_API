const { PasswordService } = require('../../../../util/passwordService');
const { configuration } = require('../../../../config/config');
const { IAuthUser, TokenService, USER_TYPE } = require('../../../../util/tokenService');
const models = require('../../../../models');
const { USER_ROLE } = require('../../../../middleware/role.middleware');
const { accountIdValidator, passwordValidator } = require('../../../../util/validators');

const loginByAccountId = {
  path: '/mobile/auth/login',
  method: 'post',
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { accountId, password } = request.body;
  const user = await models.UsersNew.findOne({
    where: {
      type: 'MOBILE',
      accountId,
    },
  });

  if (!user || user.type.toLowerCase() !== USER_TYPE.MOBILE) {
    return next('ACCOUNT_NOT_EXISTS');
  }

  const userStatusError = checkUserStatus(user.status);
  if (userStatusError) {
    return next(userStatusError);
  }

  const config = configuration();
  const passwordService = new PasswordService(config);
  const tokenService = new TokenService(config);

  if (!user.hashPassword) {
    return next('INVALID_LOGIN_METHOD');
  }

  const isMatchPassword = await passwordService.compare(password, user.hashPassword);

  if (!isMatchPassword) {
    return next('PASSWORD_NOT_MATCH');
  }

  const type = Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type) || USER_TYPE.MOBILE;
  const authUser = {
    id: user.id,
    accountId: user.accountId,
    type,
  };
  const accessToken = await tokenService.accessTokenGenerator(authUser);
  const refreshToken = await tokenService.refreshTokenGenerator(authUser); 
  await models.UsersNew.update(
    {
      lastOnline: new Date(),
      refreshToken,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  return response.status(200).json({
    accessToken,
    refreshToken,
  });
}

function validator(request, response, next) {
  const { body } = request;

  if (!body) {
    throw 'INVALID_PAYLOAD';
  }

  if (!body.accountId) {
    throw 'ACCOUNT_ID_IS_EMPTY';
  }

  const accountId = body.accountId.toString().trim();
  if (accountId.length < 6 || accountId.length > 12) {
    throw 'INVALID_ACCOUNT_ID_LENGTH';
  }

  const isValidAccountIdRegex = accountIdValidator(accountId);
  if (!isValidAccountIdRegex) {
    throw 'INVALID_ACCOUNT_ID';
  }

  // validate password
  if (!body.password) {
    throw 'PASSWORD_IS_EMPTY';
  }

  const { password } = body;
  if (password.length < 8 || password.length > 12) {
    throw 'INVALID_PASSWORD_LENGTH';
  }

  const isValidPassword = passwordValidator(password);
  if (!isValidPassword) {
    throw 'INVALID_PASSWORD';
  }

  request.body.accountId = accountId;
  next();
}

function errorHandler(error, request, response, next) {
  console.error('error::', error);
  if (error === 'INVALID_PAYLOAD') {
    return response.error.badRequest(error, '계정 Id가 존재합니다.');
  }

  if (error === 'ACCOUNT_ID_IS_EMPTY') {
    return response.error.badRequest(error, '아이디가 입력해주세요.');
  }

  if (error === 'INVALID_ACCOUNT_ID_LENGTH') {
    return response.error.badRequest(error, '6~12자 사이로 입력해주세요.');
  }

  if (error === 'INVALID_ACCOUNT_ID') {
    return response.error.badRequest(error, '영문숫자 조합으로 입력해주세요.');
  }

  if (error === 'PASSWORD_IS_EMPTY') {
    return response.error.badRequest(error, '비밀번호를 입력해주세요.');
  }

  if (error === 'INVALID_PASSWORD_LENGTH') {
    return response.error.badRequest(error, '8~12자 사이로 입력해주세요.');
  }

  if (error === 'INVALID_PASSWORD') {
    return response.error.badRequest(error, '영문,숫자,특수문자 조합으로 입력해주세요.');
  }

  if (error === 'ACCOUNT_NOT_EXISTS') {
    return response.error.badRequest(error, '회원가입된 유저의 정보가 없습니다.');
  }

  if (error === 'SLEEP_USER') {
    return response.error.badRequest(error, '이미 탈퇴한 회원입니다.');
  }

  if (error === 'BLOCK_USER') {
    return response.error.badRequest(error, '로그인 오류!(블락된 사용자).');
  }

  if (error === 'RETIRED_USER') {
    return response.error.badRequest(error, '로그인 오류!(탈퇴처리된 사용자).');
  }

  if (error === 'INVALID_LOGIN_METHOD') {
    return response.error.badRequest(error, '올바르지 않은 접근입니다.');
  }

  if (error === 'PASSWORD_NOT_MATCH') {
    return response.error.badRequest(error, '로그인에 실패했습니다. 비밀번호를 확인해주세요.');
  }

  return next();
}

const USER_STATUS = {
  active: 'ACTIVE',
  sleep: 'SLEEP',
  block: 'BLOCK',
  retired: 'RETIRED',
};

function checkUserStatus(userStatus) {
  const status = {
    [USER_STATUS.sleep]: 'SLEEP_USER',
    [USER_STATUS.block]: 'BLOCK_USER',
    [USER_STATUS.retired]: 'RETIRED_USER',
    [USER_STATUS.active]: '',
  };

  return status[userStatus] || '';
}

module.exports = { loginByAccountId, USER_STATUS, checkUserStatus };
