const { configuration } = require('../../../../config/config');
const sequelize = require('sequelize');
const { IAuthUser, TokenService, USER_TYPE } = require('../../../../util/tokenService');
const { idGenerator } = require('../../../../util/idGenerator');
const { PasswordService } = require('../../../../util/passwordService');
const models = require('../../../../models');
const axios = require('axios');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');
const { Op } = require('sequelize');
const { verify, decode } = require('jsonwebtoken');
const { BadRequestException } = require('../../../../exceptions/badRequest.exception');
const { USER_STATUS } = require('../loginByAccountId/loginByAccountId');

const socialLogin = {
  path: ['/mobile/auth/sns/login'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { token } = _request.body;
  const provider = _request.body.provider ? _request.body.provider.toUpperCase() : 'KAKAO';
  const config = configuration();
  const passwordService = new PasswordService(config);
  const tokenService = new TokenService(config);

  if (provider === 'KAKAO') {
    // Social Login with KAKAO
    try {
      let profile = await GetProfile(token);
      if (!profile.result) {
        const res = profile['data'];
        _response.json({
          status: res.response?.status,
          result: 'fail',
          message: res.message,
        });
        return;
      }

      profile = profile?.data;

      let result;
      let message;

      if (!profile?.data?.id) {
        result = 'fail';
        message = 'Invalid Token.';
        _response.json({
          result,
          message,
        });
        return;
      }

      const userResult = await models.sequelize.query(
        ` SELECT UN.*
                  FROM UsersNews UN
                  WHERE UN.type = 'MOBILE' AND UN.status = 'ACTIVE' AND UN.id = (SELECT MAX(usersNewId) FROM UserOauths WHERE oAuthId = :oAuthId and provider = :provider)`,
        {
          replacements: { oAuthId: profile.data.id, provider: 'KAKAO' },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      let existUser;
      if (userResult?.length) {
        existUser = userResult[0];
      } else {
        existUser = null;
      }

      let accessToken, refreshToken;

      if (!existUser) {
        // 연동된 회원정보가 없다면 fail처리
        result = 'fail';
        message = '연동된 회원정보가 없습니다.';
        _response.json({
          result,
          message,
        });
        return;
      } else {
        // 연동된 회원정보가 있다면 login처리
        const type = Object.values(USER_TYPE).find((item) => item.toUpperCase() === existUser.type) || USER_TYPE.MOBILE;
        const authUser = {
          id: existUser.id,
          accountId: existUser.accountId,
          type,
        };
        accessToken = await tokenService.accessTokenGenerator(authUser);
        refreshToken = await tokenService.refreshTokenGenerator(authUser);

        await models.UsersNew.update(
          {
            refreshToken,
          },
          {
            where: {
              id: { [Op.eq]: existUser.id },
            },
          }
        );
      }
      return _response.status(200).json({
        accessToken,
        refreshToken,
      });
    } catch (e) {
      next(e);
    }
  } else if (provider === 'GOOGLE') {
    // Social Login with GOOGLE
    try {
      let profile = await GetProfileGoogle(token);

      if (!profile.result) {
        const res = profile['data'];
        _response.json({
          status: res.response?.status,
          result: 'fail',
          message: res.message,
        });
        return;
      }

      profile = profile?.data;

      let result;
      let message;

      const userResult = await models.sequelize.query(
        ` SELECT UN.*
                  FROM UsersNews UN
                  WHERE UN.type = 'MOBILE' AND UN.status = 'ACTIVE' AND UN.id = (SELECT MAX(usersNewId) FROM UserOauths WHERE oAuthId = :oAuthId and provider = :provider)`,
        {
          replacements: { oAuthId: profile?.data?.id, provider: 'GOOGLE' },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      let existUser;
      if (userResult?.length) {
        existUser = userResult[0];
      } else {
        existUser = null;
      }

      let accessToken, refreshToken;

      if (!existUser) {
        // 연동된 회원정보가 없다면 fail처리
        result = 'fail';
        message = '연동된 회원정보가 없습니다.';
        _response.json({
          result,
          message,
        });
        return;
      } else {
        // 연동된 회원정보가 있다면 login처리
        const type = Object.values(USER_TYPE).find((item) => item.toUpperCase() === existUser.type) || USER_TYPE.MOBILE;
        const authUser = {
          id: existUser.id,
          accountId: existUser.accountId,
          type,
        };
        accessToken = await tokenService.accessTokenGenerator(authUser);
        refreshToken = await tokenService.refreshTokenGenerator(authUser);

        await models.UsersNew.update(
          {
            refreshToken,
          },
          {
            where: {
              id: existUser.id,
            },
          }
        );
      }
      return _response.status(200).json({
        accessToken,
        refreshToken,
      });
    } catch (e) {
      next(e);
    }
  } else if (provider === 'NAVER') {
    // Social Login with NAVER
    try {
      let profile = await GetProfileNaver(token);

      if (!profile.result) {
        const res = profile['data'];
        _response.json({
          status: res.response?.status,
          result: 'fail',
          message: res.message,
        });
        return;
      }

      profile = profile?.data?.data;

      let result;
      let message;

      const userResult = await models.sequelize.query(
        ` SELECT UN.*
                  FROM UsersNews UN
                  WHERE UN.type = 'MOBILE' AND UN.status = 'ACTIVE' AND UN.id = (SELECT MAX(usersNewId) FROM UserOauths WHERE oAuthId = :oAuthId and provider = :provider)`,
        {
          replacements: { oAuthId: profile?.response?.id, provider: 'NAVER' },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      let existUser;
      if (userResult?.length) {
        existUser = userResult[0];
      } else {
        existUser = null;
      }

      let accessToken, refreshToken;

      if (!existUser) {
        // 연동된 회원정보가 없다면 fail처리
        result = 'fail';
        message = '연동된 회원정보가 없습니다.';
        _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          result,
          message,
        });
        return;
      } else {
        // 연동된 회원정보가 있다면 login처리
        const type = Object.values(USER_TYPE).find((item) => item.toUpperCase() === existUser.type) || USER_TYPE.MOBILE;
        const authUser = {
          id: existUser.id,
          accountId: existUser.accountId,
          type,
        };
        accessToken = await tokenService.accessTokenGenerator(authUser);
        refreshToken = await tokenService.refreshTokenGenerator(authUser);

        await models.UsersNew.update(
          {
            refreshToken,
          },
          {
            where: {
              id: existUser.id,
            },
          }
        );
      }
      return _response.status(200).json({
        accessToken,
        refreshToken,
      });
    } catch (e) {
      next(e);
    }
  }

  try {
    if (provider === 'BIO') {
      const user = await models.UsersNew.findOne({
        where: {
          deviceId: token,
          type: 'MOBILE',
          status: 'ACTIVE',
        },
      });

      if (!user) {
        return next('DEVICE_NOT_LINKED');
      }

      const type = Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type) || USER_TYPE.MOBILE;
      const authUser = {
        id: user.id,
        accountId: user.accountId,
        type,
      };
      const accessToken = await tokenService.accessTokenGenerator(authUser);
      const refreshToken = await tokenService.refreshTokenGenerator(authUser);

      return _response.status(HTTP_STATUS_CODE.OK).json({
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    next(error);
  }

  try {
    if (provider === 'APPLE') {
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
        throw new BadRequestException('연동된 회원정보가 없습니다.', 'APPLE_ERROR');
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
    }
  } catch (error) {
    console.log('error::', error);
    throw new BadRequestException('연동된 회원정보가 없습니다.', 'APPLE_ERROR');
  }
}

function validator(_request, _response, next) {
  const { token } = _request.body;

  if (!token) {
    next('Need Token.');
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

  if (_error === 'ALREADY_EXIST_USER') {
    _response.error.notFound(_error, '해당전화번호의 회원은 이미 가입되어 있습니다.');
    return;
  }

  if (_error === 'DEVICE_NOT_LINKED') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '먼저 로그인 후, 바이오 로그인 연결을 진행 해주세요.',
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

module.exports = { socialLogin };
