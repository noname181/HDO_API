const { PERMISSION } = require('../../../../middleware/permission.middleware');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware'); 
const { USER_STATUS } = require('../updateUserByAdmin/updateUserByAdmin');
const models = require('../../../../models');
const { Op } = require('sequelize');
const { idGenerator } = require('../../../../util/idGenerator');
const { configuration } = require('../../../../config/config');
const { PasswordService } = require('../../../../util/passwordService');
const { USER_TYPE } = require('../../../../util/tokenService');
const { transformUser } = require('../../../mobileControllers/user/transformUser/transformUser');
const { responseFields } = require('../getUsers/getUsers');
const { PERMISSION_NAME } = require('../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../middleware/newRole.middleware');
const { createMobileAccount } = require('../../../mobileControllers/auth/register/createMobileUser');
const { validateRegister } = require('../../../mobileControllers/auth/register/validateRegister');

const createMobileUser = {
  path: '/web/users/mobile',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) { 
  const { body } = request;
  const {
    accountId,
    email,
    phoneNo,
    name,
    password,
    status = 'ACTIVE',
    birth,
    gender,
    address,
    detailAddress,
    zipCode,
  } = body;

  const createMobileUserPayload = {
    type: USER_TYPE.MOBILE.toUpperCase(),
    accountId,
    password,
    email,
    phoneNumber: phoneNo,
    userName: name || undefined,
    birth: birth || undefined,
    gender: gender || undefined,
    address: address || undefined,
    detailAddress: detailAddress || undefined,
    zipCode: zipCode || undefined,
    status,
  };

  try {  
      const validationError = await validateRegister(createMobileUserPayload); 
      if (!validationError) { 
          const user = await createMobileAccount(createMobileUserPayload);
          if (typeof user === 'string') {
            return next(user);
          }

          const userRes = transformUser({
            fields: responseFields[USER_TYPE.MOBILE],
            user,
          });
          return response.status(HTTP_STATUS_CODE.CREATE).json(userRes);
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
  console.log('error::', error);
  if (error === 'NO_REQUIRED_INPUT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '필수 입력 정보가 누락되었습니다.',
    });
  }

  if (error === 'INVALID_ACCOUNT_ID') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '영문숫자 조합으로 입력해주세요.',
    });
  }

  if (error === 'INVALID_PASSWORD') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '영문,숫자,특수문자 조합으로 입력해주세요.',
    });
  }

  if (error === 'INVALID_EMAIL') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일 형식이 아닙니다.',
    });
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
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '로그인 오류!(블락된 사용자).',
    });
  }

  if (error === 'ALREADY_EXIST_USER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 사용중인 아이디입니다.',
    });
  }

  if (error === 'ALREADY_EXIST_EMAIL') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일이 사용되었습니다.',
    });
  }

  if (error === 'ALREADY_EXIST_PHONE_NUMBER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '전화번호가 존재합니다.',
    });
  }

  if (error === 'ERROR_REGISTER') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '작성되지 않았습니다.',
    });
  }

  next();
}

module.exports = { createMobileUser };
