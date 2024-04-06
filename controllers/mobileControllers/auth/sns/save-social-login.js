const sequelize = require('sequelize');
const { idGenerator } = require('../../../../util/idGenerator');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');

const models = require('../../../../models');
const axios = require('axios');
const { BadRequestException } = require('../../../../exceptions/badRequest.exception');

module.exports = {
  path: '/mobile/auth/sns/save',
  method: 'post',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { user, body } = _request;
  const { token } = body;
  const provider = body.provider ? body.provider.toUpperCase() : 'KAKAO';

  const getUser = await models.UsersNew.findOne({
    where: {
      id: user.id,
      type: 'MOBILE',
    },
  });

  if (!getUser) {
    return next('USER_IS_NOT_FOUND');
  }

  if (getUser.status === 'BLOCK') {
    return next('BLOCK_USER');
  }

  try {
    if (provider == 'KAKAO') {
      // 카카오 연동추가

      try {
        let { result, data } = await GetProfile(token);
        if (!result) {
          return _response.status(HTTP_STATUS_CODE.SERVICE_UN_AVAILABLE).json({
            errorCode: 'KAKAO_RESPONSE_ERROR',
            timestamp: new Date().toISOString(),
            path: _request.url,
            message: JSON.stringify(data),
          });
        }

        // 이미 해당 SNS 아이디가 연동이 된 아이디가 있는지 체크
        const alreadyConnected = await models.sequelize.query(
          `SELECT COUNT(*) as cnt FROM UserOauths WHERE oAuthId = :oAuthId AND provider = :provider`,
          {
            replacements: { oAuthId: data.data.id, provider: 'KAKAO' },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        if (alreadyConnected[0]?.cnt > 0) {
          return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: 'KAKAO_ALREADY_CONNECTED',
            timestamp: new Date().toISOString(),
            path: _request.url,
            message: '카카오 계정은 이미 타 사용자에게 연동되어 있습니다.',
          });
        }

        const getUserOauthByIdAndProvider = await models.sequelize.query(
          `SELECT UO.*
         FROM UserOauths UO
         WHERE usersNewId = :usersNewId
         and provider = :provider 
         `,
          {
            replacements: { usersNewId: user.id, provider: 'KAKAO' },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        let alreadyExists;
        if (getUserOauthByIdAndProvider?.length) {
          alreadyExists = true;
        } else {
          alreadyExists = false;
        }

        if (!alreadyExists) {
          // 저장된 정보가 없을 경우 카카오 연동을 추가해준다.
          const alreadyExistsUser = await models.UsersNew.findOne({
            where: { id: user.id },
          });

          const oAuthCreateInput = {
            oAuthId: data.data.id,
            provider: 'KAKAO',
            email: data.data.email || alreadyExistsUser?.email,
            profileImage: null,
            usersNewId: alreadyExistsUser?.id,
            accountId: alreadyExistsUser?.accountId,
          };

          await models.UserOauth.create(oAuthCreateInput);

          return _response.status(200).json({
            result: 'success',
            message: '성공적으로 등록되었습니다.(KAKAO)',
          });
        } else {
          // 이미 해당 계정에 카카오 계정연동이 존재하는 경우
          return _response.status(200).json({
            result: 'fail',
            message: '이미 연동된 간편로그인 정보가 존재합니다.(KAKAO)',
          });
        }
      } catch (e) {
        next(e);
      }
    } else if (_request.body.provider == 'GOOGLE') {
      // GOOGLE 연동추가
      const token = _request.body.token;

      try {
        let { result, data } = await GetProfileGoogle(token);
        if (!result) {
          return _response.status(HTTP_STATUS_CODE.SERVICE_UN_AVAILABLE).json({
            errorCode: 'GOOGLE_RESPONSE_ERROR',
            timestamp: new Date().toISOString(),
            path: _request.url,
            message: JSON.stringify(data),
          });
        }

        // 이미 해당 SNS 아이디가 연동이 된 아이디가 있는지 체크
        const alreadyConnected = await models.sequelize.query(
          `SELECT COUNT(*) as cnt FROM UserOauths WHERE oAuthId = :oAuthId AND provider = :provider`,
          {
            replacements: { oAuthId: data.data?.id, provider: 'GOOGLE' },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        if (alreadyConnected[0]?.cnt > 0) {
          return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: 'GOOGLE_ALREADY_CONNECTED',
            timestamp: new Date().toISOString(),
            path: _request.url,
            message: '구글 계정은 이미 타 사용자에게 연동되어 있습니다.',
          });
        }

        const getUserOauthByIdAndProvider = await models.sequelize.query(
          `SELECT UO.* 
         FROM UserOauths UO 
         WHERE usersNewId = :usersNewId 
         and provider = :provider 
         `,
          {
            replacements: { usersNewId: user.id, provider: 'GOOGLE' },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        let alreadyExists;
        if (getUserOauthByIdAndProvider?.length) {
          alreadyExists = true;
        } else {
          alreadyExists = false;
        }

        if (!alreadyExists) {
          // 저장된 정보가 없을 경우 카카오 연동을 추가해준다.
          const alreadyExistsUser = await models.UsersNew.findOne({
            where: { id: user.id },
          });

          const oAuthCreateInput = {
            oAuthId: data.data?.id,
            provider: 'GOOGLE',
            email: data.data?.email || alreadyExistsUser?.email,
            profileImage: null,
            usersNewId: alreadyExistsUser?.id,
            accountId: alreadyExistsUser?.accountId,
          };

          await models.UserOauth.create(oAuthCreateInput);

          return _response.status(200).json({
            result: 'success',
            message: '성공적으로 등록되었습니다.(GOOGLE)',
          });
        } else {
          // 이미 해당 계정에 카카오 계정연동이 존재하는 경우
          return _response.status(200).json({
            result: 'fail',
            message: '이미 연동된 간편로그인 정보가 존재합니다.(GOOGLE)',
          });
        }
      } catch (e) {
        next(e);
      }
    } else if (_request.body.provider == 'NAVER') {
      // NAVER 연동추가
      const token = _request.body.token;

      try {
        let { result, data } = await GetProfileNaver(token);
        if (!result) {
          return _response.status(HTTP_STATUS_CODE.SERVICE_UN_AVAILABLE).json({
            errorCode: 'NAVER_RESPONSE_ERROR',
            timestamp: new Date().toISOString(),
            path: _request.url,
            message: JSON.stringify(data),
          });
        }

        // 이미 해당 SNS 아이디가 연동이 된 아이디가 있는지 체크
        const alreadyConnected = await models.sequelize.query(
          `SELECT COUNT(*) as cnt FROM UserOauths WHERE oAuthId = :oAuthId AND provider = :provider`,
          {
            replacements: { oAuthId: data.data?.response?.id, provider: 'NAVER' },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        if (alreadyConnected[0]?.cnt > 0) {
          return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            errorCode: 'NAVER_ALREADY_CONNECTED',
            timestamp: new Date().toISOString(),
            path: _request.url,
            message: '네이버 계정은 이미 타 사용자에게 연동되어 있습니다.',
          });
        }

        const getUserOauthByIdAndProvider = await models.sequelize.query(
          `SELECT UO.*
         FROM UserOauths UO
         WHERE usersNewId = :usersNewId
         and provider = :provider 
         `,
          {
            replacements: { usersNewId: user.id, provider: 'NAVER' },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        let alreadyExists;
        if (getUserOauthByIdAndProvider?.length) {
          alreadyExists = true;
        } else {
          alreadyExists = false;
        }

        if (!alreadyExists) {
          // 저장된 정보가 없을 경우 네이버 연동을 추가해준다.
          const alreadyExistsUser = await models.UsersNew.findOne({
            where: { id: user.id },
          });

          const oAuthCreateInput = {
            oAuthId: data.data?.response?.id,
            provider: 'NAVER',
            email: data.data?.response?.email || alreadyExistsUser?.email,
            profileImage: null,
            usersNewId: alreadyExistsUser?.id,
            accountId: alreadyExistsUser?.accountId,
          };

          await models.UserOauth.create(oAuthCreateInput);

          return _response.status(200).json({
            result: 'success',
            message: '성공적으로 등록되었습니다.(NAVER)',
          });
        } else {
          // 이미 해당 계정에 카카오 계정연동이 존재하는 경우
          return _response.status(200).json({
            result: 'fail',
            message: '이미 연동된 간편로그인 정보가 존재합니다.(NAVER)',
          });
        }
      } catch (e) {
        next(e);
      }
    } else if (provider === 'BIO') {
      const [getUser, hasUser] = await Promise.all([
        models.UsersNew.findByPk(user.id),
        models.UsersNew.findOne({ where: { deviceId: token } }),
      ]);

      if (!getUser) {
        return next('USER_IS_NOT_FOUND');
      }

      if (hasUser && hasUser.id !== getUser.id) {
        await models.UsersNew.update({ deviceId: null }, { where: { id: hasUser.id } });
      }

      if (getUser.deviceId !== token) {
        await models.UsersNew.update({ deviceId: token }, { where: { id: getUser.id } });
      }
      return _response.status(HTTP_STATUS_CODE.NO_CONTENT).json({});
    }
  } catch (error) {
    next(error);
  }

  try {
    if (provider === 'APPLE') {
      const hasConnectToApple = await models.UserOauth.findOne({
        where: {
          [sequelize.Op.and]: [
            {
              usersNewId: getUser.id,
            },
            {
              provider,
            },
          ],
        },
      });

      if (hasConnectToApple) {
        throw BadRequestException('이미 연동된 간편로그인 정보가 존재합니다. (APPLE)', 'APPLE_ERROR');
      }

      const oAuthCreateInput = {
        oAuthId: token,
        provider: 'APPLE',
        email: getUser.email,
        profileImage: null,
        usersNewId: getUser.id,
        accountId: getUser.accountId,
      };

      await models.UserOauth.create(oAuthCreateInput);

      return _response.status(200).json({
        result: 'success',
        message: '성공적으로 등록되었습니다.(APPLE)',
      });
    }
  } catch (error) {
    throw new BadRequestException('연동된 회원정보가 없습니다.', 'APPLE_ERROR');
  }
}

function validator(_request, _response, next) {
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

  if (_error === 'BLOCK_USER') {
    return _response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: _error,
      timestamp: new Date().toISOString(),
      path: _request.url,
      message: '로그인 오류!(블락된 사용자).',
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
