const { configuration } = require('../../../../config/config');
const { PasswordService } = require('../../../../util/passwordService');
const { IAuthUser, TokenService, USER_TYPE } = require('../../../../util/tokenService');
const { idGenerator } = require('../../../../util/idGenerator');

const { USER_ROLE } = require('../../../../middleware/role.middleware');
const { encrypt } = require('../../../../util/cryptor');
 
const { HTTP_STATUS_CODE } = require('../../../../middleware/newRole.middleware');
const { Op } = require('sequelize');
const { USER_STATUS } = require('../loginByAccountId/loginByAccountId');
const { createMobileAccount } = require('./createMobileUser');
const { validateRegister } = require('./validateRegister');
const { sendRegCmpMsg } = require("../../../../util/notificationTalk/notificationTemplate")
const { sendTalkAndLms } = require("../../../../util/sendTalkAndLmsUtil");
const {phoneFormatter, getFormatDateToDays} = require("../../../../util/common-util");

const register = {
  path: '/mobile/auth/register',
  method: 'post',
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const config = configuration();
  const tokenService = new TokenService(config);

  const {
    accountId,
    password,
    email,
    phoneNumber,
    userName = '',
    dupinfo,
    birth = '',
    gender = '',
    address = '',
    detailAddress = '',
    zipCode = '',
  } = request.body;

  const createMobileUserPayload = {
    type: USER_TYPE.MOBILE.toUpperCase(),
    accountId,
    password,
    email,
    phoneNumber,
    userName: userName || undefined,
    dupinfo: dupinfo || undefined,
    birth: birth || undefined,
    gender: gender || undefined,
    address: address || undefined,
    detailAddress: detailAddress || undefined,
    zipCode: zipCode || undefined,
    status: USER_STATUS.active,
  };
  try { 
    const validationError = await validateRegister(createMobileUserPayload); 
    if (!validationError) { 
      const user = await createMobileAccount(createMobileUserPayload); 
      const authUser = {
        id: user.id,
        accountId: user.accountId,
        type: USER_TYPE.MOBILE,
      };
  
      const accessToken = await tokenService.accessTokenGenerator(authUser);
      const refreshToken = await tokenService.refreshTokenGenerator(authUser);

      // 회원 가입 성공시 추가형 알림톡을 보낸다.
      if (user) {
        const phoneString = phoneFormatter(process.env.CS_CALL_NUM || '15515129')
        const dateString = getFormatDateToDays(new Date())
        const sendRegCmpMsgData = sendRegCmpMsg(user?.name, dateString, phoneString)
        const response = await sendTalkAndLms(user?.phoneNo, sendRegCmpMsgData?.message, sendRegCmpMsgData?.templateCode);
      }
      return response.status(HTTP_STATUS_CODE.OK).json({
        accessToken,
        refreshToken,
      });
    } else {
      throw validationError;
    }
  } catch (error) {
    next(error);
  }
  
}

function validator(request, response, next) { 
  next();
}

function errorHandler(error, request, response, next) {
  console.error('error::', error);

  if (error === 'INVALID_ACCOUNT_ID') {
    return response.error.badRequest(error, '영문숫자 조합으로 입력해주세요.');
  }

  if (error === 'INVALID_PASSWORD') {
    return response.error.badRequest(error, '영문,숫자,특수문자 조합으로 입력해주세요.');
  }

  if (error === 'INVALID_EMAIL') {
    return response.error.badRequest(error, '이메일 형식이 아닙니다.');
  }

  if (error === 'INVALID_PHONE_NUMBER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유효하지 않은 전화번호입니다.',
    });
  }

  if (error === 'BLOCK_USER') {
    return response.error.badRequest(error, '로그인 오류!(블락된 사용자).');
  }

  if (error === 'ALREADY_EXIST_USER') {
    return response.error.badRequest(error, '이미 사용중인 아이디입니다.');
  }

  if (error === 'ALREADY_EXIST_EMAIL') {
    return response.error.badRequest(error, '이미 사용중인 이메일입니다.');
  }

  if (error === 'ALREADY_EXIST_PHONE_NUMBER') {
    return response.error.badRequest(error, '전화번호가 존재합니다.');
  }

  if (error === 'ERROR_REGISTER') {
    return response.error.unknown('계정 등록 진행 시 에러가 발견 되었습니다.');
  }

  next(error);
} 

module.exports = { register };
