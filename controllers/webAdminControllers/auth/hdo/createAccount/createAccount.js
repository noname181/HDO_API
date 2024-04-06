const { USER_ROLE } = require('../../../../../middleware/role.middleware');
const models = require('../../../../../models');
const { HTTP_STATUS_CODE } = require('../../../../../middleware/role.middleware');
const { PasswordService } = require('../../../../../util/passwordService');
const { configuration } = require('../../../../../config/config');
const { Op } = require('sequelize');
const { idGenerator } = require('../../../../../util/idGenerator');
const { USER_TYPE } = require('../../../../../util/tokenService');
const { transformUser } = require('../../../../mobileControllers/user/transformUser/transformUser');
const {
  emailValidator,
  passwordValidator,
  phoneNoValidator,
  accountIdAdminValidator,
} = require('../../../../../util/validators');
const { PERMISSION_NAME } = require('../../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../../middleware/newRole.middleware');
const { transformAdminUser } = require('../../../user/transformAdminUser/transformAdminUser');
const { USER_STATUS } = require('../../../../mobileControllers/auth/loginByAccountId/loginByAccountId');
const { LoggerService } = require('../../../../../services/loggerService/loggerService');
const { validateRegister } = require('../../register/validateRegister');

const createAccount = {
  path: '/web/auth/hdo/register',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const loggerService = new LoggerService();
  const { body } = request;

  // TODO should not hard code. solution is make table have column unique and query with this column to find HDO organization
  const ORG_ID = 2;
  const status = body.status || USER_STATUS.active;

  const validationError = await validateRegister(ORG_ID, USER_TYPE.HDO.toUpperCase(), body);

  if (validationError) {
    return next(validationError);
  }

  const sapPerson = await models.SAP_Person.findByPk(body.accountId);
  const email = sapPerson.EMAIL || body.email;
  const phoneNo = sapPerson.PHONE || body.phoneNo;
  const md5Password = sapPerson.PASSWORD;
  const config = configuration();
  const passwordService = new PasswordService(config);
  const { salt, passwordHashed } = await passwordService.hash(md5Password);
  try {
    const savedUser = await models.UsersNew.create({
      accountId: sapPerson.PERNR || body.accountId,
      name: sapPerson.ENAME || body.name,
      dept: sapPerson.ORGEH || body.dept,
      idEmailVerified: false,
      phoneNo: phoneNo || null,
      email: email || null,
      orgId: ORG_ID,
      type: USER_TYPE.HDO,
      roleId: body.role,
      status,
      isRequireCreateAccount: false,
      saltRounds: salt,
      hashPassword: passwordHashed,
      md5Password,
    });
    const getUser = await models.UsersNew.findByPk(savedUser.id, {
      include: [
        {
          model: models.Role,
        },
      ],
    });

    if (!getUser) {
      throw 'ERROR_WHILE_CREATE_HDO_ACCOUNT';
    }

    const result = {
      success: 'success',
      data: transformAdminUser(getUser),
    };
    return response.status(HTTP_STATUS_CODE.OK).json(result);
  } catch (error) {
    loggerService.error('Register hdo account::', error);
    if (error instanceof Error) {
      return next('ERROR_WHILE_CREATE_HDO_ACCOUNT');
    }

    return next(error);
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'INVALID_PAYLOAD') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '계정 Id가 존재합니다.',
    });
  }

  if (error === 'NO_REQUIRED_INPUT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '필수 입력 정보가 누락되었습니다.',
    });
  }

  if (error === 'INVALID_EMAIL') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '잘못된 이메일.',
    });
  }

  if (error === 'INVALID_PHONE_NUMBER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '전화번호가 유효합니다.',
    });
  }

  if (error === 'INVALID_STATUS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '계정 Id가 존재합니다.',
    });
  }

  if (error === 'ORG_ID_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '조직을 찾을 수 없습니다.',
    });
  }

  if (error === 'ROLE_ID_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '역할이 존재하지 않습니다.',
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

  if (error === 'ID_ALREADY_REGISTERED') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이 사번은 이미 등록되었습니다.',
    });
  }

  if (error === 'ACCOUNT_ID_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '',
    });
  }

  if (error === 'EMAIL_ALREADY_REGISTERED') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 사용중인 이메일 계정입니다.',
    });
  }

  if (error === 'PHONE_NUMBER_ALREADY_REGISTERED') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '전화번호가 존재합니다.',
    });
  }

  if (error === 'ERROR_WHILE_CREATE_HDO_ACCOUNT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '작성되지 않았습니다.',
    });
  }

  next();
}

module.exports = { createAccount };
