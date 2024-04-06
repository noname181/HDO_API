const { TokenService, USER_TYPE } = require('../../../../util/tokenService');
const { configuration } = require('../../../../config/config');
const { USER_ROLE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');

const refreshToken = {
  path: '/mobile/auth/token/refresh',
  method: 'post',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { user } = request;

  const getUser = await models.UsersNew.findOne({
    where: { id: user.id },
    include: [
      {
        model: models.Role,
      },
    ],
  });

  if (!getUser) {
    return next('USER_IS_NOT_FOUND');
  }

  const config = configuration();
  const tokenService = new TokenService(config);
  const type = Object.values(USER_TYPE).find((item) => item.toUpperCase() === getUser.type) || USER_TYPE.MOBILE;
  const authUser = {
    id: user.id,
    accountId: user.accountId,
    type,
    roleId: getUser.roleId || undefined,
  };
  const accessToken = await tokenService.accessTokenGenerator(authUser);
  const refreshToken = request.header('Authorization');

  return response.status(200).json({
    accessToken,
    refreshToken,
  });
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'USER_IS_NOT_FOUND') {
    return response.error.notFound(error, '해당 회원의 데이터가 존재하지 않습니다.');
  }

  next();
}

module.exports = { refreshToken };
