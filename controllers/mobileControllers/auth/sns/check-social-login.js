const sequelize = require('sequelize');
const { idGenerator } = require('../../../../util/idGenerator');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const axios = require('axios');
const { configuration } = require('../../../../config/config');
const { IAuthUser, TokenService, USER_TYPE } = require('../../../../util/tokenService');
const { BadRequestException } = require('../../../../exceptions/badRequest.exception');

module.exports = {
  path: '/mobile/auth/sns/check',
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const config = configuration();
  const tokenService = new TokenService(config);
  const { body } = _request;
  const { token = '', accountId = '', dupinfo = '' } = body;
  const provider = body.provider ? body.provider.toUpperCase() : 'KAKAO';

  const user = await models.UsersNew.findOne({
    where: {
      type: 'MOBILE',
      accountId,
      dupinfo,
    },
  });

  if (!token || !accountId || !dupinfo) {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: 'TOKEN_IS_EMPTY',
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '유효하지 않은 결제입니다.',
    });
  }

  if (!user) {
    return next('USER_IS_NOT_FOUND');
  }

  if (user.status === 'BLOCK') {
    return next('BLOCK_USER');
  }

  if (provider === 'APPLE') {
    try {
      const existUser = await models.UsersNew.findOne({
        where: {
          [Op.and]: [
            {
              type: USER_TYPE.MOBILE.toUpperCase(),
            },
            {
              status: USER_STATUS.active,
            },
            {
              '$userOauths.oAuthId$': token,
            },
            {
              '$userOauths.provider$': provider,
            },
          ],
        },
        include: [
          {
            model: models.UserOauth,
            as: 'userOauths',
          },
        ],
        subQuery: false,
      });

      if (!existUser) {
        const oAuthCreateInput = {
          oAuthId: token,
          provider: 'APPLE',
          email: getUser.email,
          profileImage: null,
          usersNewId: getUser.id,
          accountId: getUser.accountId,
        };

        await models.UserOauth.create(oAuthCreateInput);
      }

      const authUser = {
        id: existUser.id,
        accountId: existUser.accountId,
        type: existUser.type,
      };
      const accessToken = await tokenService.accessTokenGenerator(authUser);
      const refreshToken = await tokenService.refreshTokenGenerator(authUser);

      return _response.status(HTTP_STATUS_CODE.OK).json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      throw new BadRequestException('연동된 회원정보가 없습니다.', 'APPLE_ERROR');
    }
  }

  try {
    let resultSNS;
    if (provider == 'NAVER') {
      let { result, data } = await GetProfileNaver(token);
      if (!result) {
        return _response.status(HTTP_STATUS_CODE.SERVICE_UN_AVAILABLE).json({
          errorCode: 'NAVER_RESPONSE_ERROR',
          timestamp: new Date().toISOString(),
          path: _request.url,
          message: JSON.stringify(data),
        });
      }
      resultSNS = data.data?.response;
    } else if (provider == 'KAKAO') {
      let { result, data } = await GetProfile(token);
      if (!result) {
        return _response.status(HTTP_STATUS_CODE.SERVICE_UN_AVAILABLE).json({
          errorCode: 'KAKAO_RESPONSE_ERROR',
          timestamp: new Date().toISOString(),
          path: _request.url,
          message: JSON.stringify(data),
        });
      }
      resultSNS = data.data;
    } else if (provider == 'GOOGLE') {
      let { result, data } = await GetProfileGoogle(token);
      if (!result) {
        return _response.status(HTTP_STATUS_CODE.SERVICE_UN_AVAILABLE).json({
          errorCode: 'GOOGLE_RESPONSE_ERROR',
          timestamp: new Date().toISOString(),
          path: _request.url,
          message: JSON.stringify(data),
        });
      }
      resultSNS = data.data;
    }

    const userSNS = await models.UserOauth.findOne({
      where: {
        oAuthId: resultSNS?.id,
        provider,
        usersNewId: user?.id,
      },
    });

    if (!userSNS?.id) {
      const oAuthCreateInput = {
        oAuthId: resultSNS?.id,
        provider,
        email: resultSNS?.email || user?.email,
        profileImage: null,
        usersNewId: user?.id,
      };
      await models.UserOauth.create(oAuthCreateInput);
    }

    const authUser = {
      id: user?.id,
      accountId: user?.accountId,
      type: 'MOBILE',
    };

    const accessToken = await tokenService.accessTokenGenerator(authUser);
    const refreshToken = await tokenService.refreshTokenGenerator(authUser);

    await models.UsersNew.update(
      {
        refreshToken,
      },
      {
        where: {
          id: user?.id,
        },
      }
    );

    return _response.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  const { provider: providerInput } = _request.body;
  const provider = providerInput.toUpperCase() || '';
  if (!provider || (provider !== 'KAKAO' && provider !== 'NAVER' && provider !== 'GOOGLE' && provider !== 'BIO')) {
    return next('INVALID_PROVIDER');
  }
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  if (_error === 'BLOCK_USER') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '로그인 오류!(블락된 사용자).',
    });
  }

  if (_error === 'INVALID_PROVIDER') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '해당 기기는 지원하지 않습니다.',
    });
  }

  if (_error === 'ALREADY_EXIST_USER') {
    _response.json({
      status: '400',
      errorCode: 'AUTH_ALREADY_EXIST_USER',
      message: '해당전화번호의 회원은 이미 가입되어 있습니다.',
    });
    return;
  }

  if (_error === 'USER_IS_NOT_FOUND') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '회원이 없습니다.',
    });
  }

  if (_error === 'DEVICE_IS_ALREADY_CONNECT') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '기기가 이미 다른 계정에 연결되어 있습니다.',
    });
  }

  next(_error);
}

async function GetToken(code, clientId = process.env.KAKAO_SNS_CLIENT_ID) {
  const url = 'https://kauth.kakao.com/oauth/token';

  const response = await axios(url, {
    params: {
      grant_type: 'authorization_code',
      client_id: clientId,
      code: code,
    },
  });

  return response;
}

async function GetProfile(token) {
  const url = 'https://kapi.kakao.com/v2/user/me';
  let res = {
    result: true,
    data: Object,
  };

  try {
    res['data'] = await axios({
      url: url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        secure_resource: true,
        property_keys: [
          'kakao_account.email',
          'kakao_account.gender',
          'kakao_account.profile',
          'kakao_account.birthday',
        ],
      },
    });
  } catch (e) {
    res['result'] = false;
    res['data'] = e;
    return res;
  }
  return res;
}

async function GetProfileGoogle(token) {
  const url = `https://www.googleapis.com/oauth2/v1/userinfo`;
  let res = {
    result: true,
    data: Object,
  };

  try {
    res['data'] = await axios({
      url: url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        secure_resource: true,
      },
    });
  } catch (e) {
    res['result'] = false;
    res['data'] = e;
    return res;
  }
  return res;
}

async function GetProfileNaver(token) {
  const url = `https://openapi.naver.com/v1/nid/me`;
  let res = {
    result: true,
    data: Object,
  };

  try {
    res['data'] = await axios({
      url: url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        secure_resource: true,
      },
    });
  } catch (e) {
    res['result'] = false;
    res['data'] = e;
    return res;
  }

  return res;
}
