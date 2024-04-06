const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');
const { Op } = require('sequelize');
const models = require('../../../../models');

module.exports = {
  path: '/mobile/auth/sns/cancel',
  method: 'post',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const {
    body: { provider },
  } = _request;
  const { user } = _request;
  if (!user || !provider) {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: 'NO_REQUIRED_INPUT',
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '필수 입력 정보가 누락되었습니다.',
    });
  }

  try {
    const getUser = await models.UsersNew.findOne({
      where: {
        id: user.id,
        type: 'MOBILE',
      },
    });

    if (!getUser) {
      return next('USER_IS_NOT_FOUND');
    }

    if (getUser?.status === 'BLOCK') {
      return next('BLOCK_USER');
    }

    if (provider.toUpperCase() === 'BIO') {
      if (!getUser) {
        return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          errorCode: error,
          timestamp: new Date().toISOString(),
          path: _request.url,
          message: '회원이 없습니다.',
        });
      }

      if (getUser.deviceId) {
        await models.UsersNew.update({ deviceId: null }, { where: { id: getUser.id } });
      }

      return _response.status(200).json({
        result: 'success',
        message: '연동이 해지되었습니다.',
      });
    }

    const snsConnect = await models.UserOauth.findOne({
      where: {
        usersNewId: user.id,
        provider: provider.toUpperCase(),
      },
    });
    if (!snsConnect) {
      return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        errorCode: 'NO_CONNECTED_SNS',
        timestamp: new Date().toISOString(),
        path: _request.url,
        message: '가입되어 있지 않은 유저입니다. 회원가입을 먼저 진행하세요.',
      });
    }

    await models.UserOauth.destroy({
      where: {
        usersNewId: user.id,
        provider: provider.toUpperCase(),
      },
    });

    return _response.status(200).json({
      result: 'success',
      message: '연동이 해지되었습니다.',
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  const { provider: providerInput } = _request.body;
  const provider = providerInput.toUpperCase() || '';
  if (
    !provider ||
    (provider !== 'KAKAO' &&
      provider !== 'NAVER' &&
      provider !== 'GOOGLE' &&
      provider !== 'BIO' &&
      provider !== 'APPLE')
  ) {
    return next('INVALID_PROVIDER');
  }
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  if (_error === 'INVALID_PROVIDER') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '해당 기기는 지원하지 않습니다.',
    });
  }

  if (_error === 'USER_IS_NOT_FOUND') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '회원이 없습니다.',
    });
  }

  if (_error === 'BLOCK_USER') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '로그인 오류!(블락된 사용자).',
    });
  }
}
