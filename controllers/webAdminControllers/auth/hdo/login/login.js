const { USER_ROLE } = require('../../../../../middleware/role.middleware');
const { checkUserStatus } = require('../../../../mobileControllers/auth/loginByAccountId/loginByAccountId');
const { configuration } = require('../../../../../config/config');
const { PasswordService } = require('../../../../../util/passwordService');
const { TokenService, USER_TYPE } = require('../../../../../util/tokenService');
const models = require('../../../../../models');
const { accountIdAdminValidator } = require('../../../../../util/validators');
const { md5Hash } = require('../../../../../util/md5Hash');
const crypto = require('crypto');
const { USER_LOG_STATUS } = require('../../../../../interfaces/userLogStatus.interface');
const requestIp = require('request-ip');
const moment = require('moment');
const { Op } = require('sequelize');

const login = {
  path: '/web/auth/hdo/login',
  method: 'post',
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const ipAddress = requestIp.getClientIp(request);
  const { originalUrl, method, headers } = request;
  let { accountId, password } = request.body;
  try {
    accountId = accountId.replace(/\s/g, '');
    password = password.replace(/\s/g, '');

    const user = await models.UsersNew.findOne({
      where: {
        type: 'HDO',
        accountId,
      },
      include: [
        {
          model: models.Role,
        },
      ],
    });

    if (!user) {
      return next('ACCOUNT_NOT_EXISTS');
    }

    if (user.type !== USER_TYPE.HDO.toUpperCase()) {
      return next('ACCOUNT_CAN_NOT_LOGIN');
    }

    const userStatusError = checkUserStatus(user.status);
    if (userStatusError) {
      return next(userStatusError);
    }

    if (!user.hashPassword) {
      return next('INVALID_LOGIN_METHOD');
    }

    const config = configuration();
    const passwordService = new PasswordService(config);
    const tokenService = new TokenService(config);
    const comparePassword = await passwordService.compare(password, user.hashPassword);
    let isMatchPassword = comparePassword;

    let newPasswordHashed;
    let newSalt;
    if (user.md5Password) {
      // * make new bcrypt password
      const { salt, passwordHashed } = await passwordService.hash(password);
      newPasswordHashed = passwordHashed;
      newSalt = salt;

      const md5Password = md5Hash(password);
      isMatchPassword = user.md5Password === md5Password;
    }

    const foundUserLog = await models.UserLogs.findOne({
      where: {
        [Op.and]: [
          { userId: user.id },
          { ipAddress: requestIp.getClientIp(request) },
          { [Op.or]: [{ status: USER_LOG_STATUS.BLOCKED }, { status: USER_LOG_STATUS.PASSWORD_FAIL }] },
        ],
      },
      order: [['id', 'DESC']],
    });

    // Check user is blocked
    if (foundUserLog) {
      if (foundUserLog.status === USER_LOG_STATUS.BLOCKED) {
        const blockTime = 180000; //miniseconds
        // const isBlocked = !!((moment().tz('Asia/Seoul') - moment(foundUserLog.createdAt)) < blockTime);
        const currentTimestamp = await models.sequelize.query('select current_timestamp');
        const isBlocked =
          new Date(currentTimestamp[0][0].current_timestamp) - new Date(foundUserLog.createdAt) < blockTime;
        if (isBlocked) {
          return next('OVER_FAILED_LOGIN_NUMBER');
        }
      }
    }

    if (!isMatchPassword) {
      if (foundUserLog && foundUserLog.status === USER_LOG_STATUS.PASSWORD_FAIL) {
        const currentTimestamp = await models.sequelize.query('select current_timestamp');
        const loginTime = new Date(currentTimestamp[0][0].current_timestamp) - new Date(foundUserLog.createdAt);
        const watingTimeToBlock = 600000; //miniseconds

        //Check if failed login number < 5 and loginTime < 10 minutes
        if (foundUserLog.failedLoginNumber < 5 && loginTime < watingTimeToBlock) {
          await models.UserLogs.update(
            {
              failedLoginNumber: foundUserLog.failedLoginNumber + 1,
            },
            {
              where: {
                id: foundUserLog.id,
              },
            }
          );
        }

        //Check if failed login number = 5 and loginTime < 10 minutes
        if (foundUserLog.failedLoginNumber === 5 && loginTime < watingTimeToBlock) {
          await models.UserLogs.update(
            {
              status: USER_LOG_STATUS.BLOCKED,
            },
            {
              where: {
                id: foundUserLog.id,
              },
            }
          );
          return next('OVER_FAILED_LOGIN_NUMBER');
        }

        //Check loginTime > 10 minutes
        if (loginTime > watingTimeToBlock) {
          const logInfo = `user-action-log, email: ${user.id}, sub: ${user.id}, userId: ${user.id}, ip: ${ipAddress}, url: ${originalUrl}, method: ${method}, user-agent: ${headers['user-agent']}`;
          await models.UserLogs.create({
            status: USER_LOG_STATUS.PASSWORD_FAIL,
            ipAddress: requestIp.getClientIp(request),
            failedLoginNumber: 1,
            userId: user.id,
            note: logInfo,
            urlPage: originalUrl,
          });
        }
      } else if (!foundUserLog || foundUserLog.status !== USER_LOG_STATUS.PASSWORD_FAIL) {
        const logInfo = `user-action-log, email: ${user.id}, sub: ${user.id}, userId: ${user.id}, ip: ${ipAddress}, url: ${originalUrl}, method: ${method}, user-agent: ${headers['user-agent']}`;
        await models.UserLogs.create({
          status: USER_LOG_STATUS.PASSWORD_FAIL,
          ipAddress: requestIp.getClientIp(request),
          failedLoginNumber: 1,
          userId: user.id,
          note: logInfo,
          urlPage: originalUrl,
        });
      }

      return next('PASSWORD_NOT_MATCH');
    }

    const type = Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type) || USER_TYPE.MOBILE;
    const authUser = {
      id: user.id,
      accountId: user.accountId,
      type,
      roleId: user.roleId || undefined,
    };
    const accessToken = await tokenService.accessTokenGenerator(authUser);
    const refreshToken = await tokenService.refreshTokenGenerator(authUser);

    await models.UsersNew.update(
      {
        refreshToken,
        md5Password: null,
        saltRounds: newSalt,
        hashPassword: newPasswordHashed,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    const userup = await models.UsersNew.findOne({
      where: {
        id: user.id,
      },
    });
    
    const requestInfo = `, ip: ${requestIp.getClientIp(request)}, url: ${originalUrl},  method: ${method}, user-agent: ${headers['user-agent']}`;
    
    const maskSensitive = maskSensitiveKeys(request.body);
    const maskSensitiveInfo = maskSensitive ? `, ${JSON.stringify(maskSensitive)}` : '';

   
    const logInfoString = user
      ? `Login success, email: ${user.id || 'unknown'}, sub: ${user.id || 'unknown'}, userId: ${
          user.id || 'unknown'
        }${requestInfo}${maskSensitiveInfo}`
      : `Login success, email: unknown, userId: unknown${requestInfo}${maskSensitiveInfo}`;
 
    //Create user log
    await models.UserLogs.create({
      status: USER_LOG_STATUS.SUCCESS,
      ipAddress: requestIp.getClientIp(request),
      userId: user.id,
      note: logInfoString,
      urlPage: originalUrl,
    });

    return response.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next('INVALID_LOGIN_METHOD');
  }
}

function validator(request, response, next) {
  let { body } = request;
  let { accountId, password } = body;

  accountId = accountId.replace(/\s/g, '');
  password = password.replace(/\s/g, '');

  if (!body) {
    throw 'INVALID_PAYLOAD';
  }

  if (!accountId) {
    throw 'ACCOUNT_ID_IS_EMPTY';
  }

  const isValidAccountId = accountIdAdminValidator(accountId);
  if (!isValidAccountId) {
    throw 'INVALID_ACCOUNT_ID';
  }

  if (!password || password.toString().length === 0) {
    throw 'PASSWORD_IS_EMPTY';
  }

  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'INVALID_PAYLOAD') {
    return response.error.badRequest(error, '계정 Id가 존재합니다.');
  }

  if (error === 'ACCOUNT_ID_IS_EMPTY') {
    return response.error.badRequest(error, '사번을 입력해주세요.');
  }

  if (error === 'INVALID_ACCOUNT_ID') {
    return response.error.badRequest(error, '특수문자는 입력할수 없습니다.');
  }

  if (error === 'PASSWORD_IS_EMPTY') {
    return response.error.badRequest(error, '비밀번호를 입력해주세요.');
  }

  if (error === 'PASSWORD_IS_EMPTY') {
    return response.error.badRequest(error, '8~12자 사이로 입력해주세요.');
  }

  if (error === 'ACCOUNT_NOT_EXISTS') {
    return response.error.badRequest(error, '회원가입된 유저의 정보가 없습니다.');
  }

  if (error === 'ACCOUNT_CAN_NOT_LOGIN') {
    return response.error.badRequest(error, '귀하의 계정은 외부 로그인이 불가능합니다.');
  }

  if (error === 'ACCOUNT_NOT_APPROVED') {
    return response.error.badRequest(error, '사용자가 아직 승인되지 않았습니다.');
  }

  if (error === 'SLEEP_USER') {
    return response.error.badRequest(error, '로그인 오류!(휴면전환된 사용자).');
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
    return response.error.badRequest(error, '비밀번호가 일치하지 않습니다.');
  }

  if (error === 'OVER_FAILED_LOGIN_NUMBER') {
    return response.error.badRequest(error, '비밀번호 5회 오류입니다. 3분간 로그인이 안됩니다.');
  }
  next();
}

module.exports = { login };
function maskSensitiveKeys(request) {
  const { body } = request;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return {};
  }
  const requestBody = (0, lodash_1.cloneDeep)(body);
  const keys = Object.keys(requestBody);
  for (const key of keys) {
      if (typeof body[key] === 'string' &&
          (key.toLowerCase().includes('password') ||
              key.toLowerCase().includes('name') ||
              key.toLowerCase().includes('phonenumber') ||
              key.toLowerCase().includes('phoneno'))) {
          requestBody[key] = '********';
      }
  }
  return requestBody;
}