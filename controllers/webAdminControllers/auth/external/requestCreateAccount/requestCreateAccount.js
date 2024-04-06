const { USER_ROLE } = require('../../../../../middleware/role.middleware');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../../../../util/tokenService');
const { idGenerator } = require('../../../../../util/idGenerator');
const { HTTP_STATUS_CODE } = require('../../../../../middleware/role.middleware');
const models = require('../../../../../models'); 
const { responseFields } = require('../../../user/getUsers/getUsers');
const { transformUser } = require('../../../../mobileControllers/user/transformUser/transformUser');
const { PERMISSION_NAME } = require('../../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../../middleware/newRole.middleware');
const { transformAdminUser } = require('../../../user/transformAdminUser/transformAdminUser');
const { USER_STATUS } = require('../../../../mobileControllers/auth/loginByAccountId/loginByAccountId');
const {
  accountIdValidator,
  passwordValidator,
  emailValidator,
  phoneNoTransform,
  phoneNoValidator,
} = require('../../../../../util/validators');
const USER_PERMISSION = {
  admin: 'ADMIN',
  viewer: 'VIEWER',
};

const requestCreateAccount = {
  path: '/web/auth/accounts/external/requests',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.client],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) { 
  const { body } = request;

  if (!body || !body.role || !body.name || !body.accountId || !body.orgId || !body.phoneNo) {
    return next('NO_REQUIRED_INPUT');
  }

  if (!emailValidator(body.accountId)) {
    return next('INVALID_ACCOUNT_ID');
  }

  const phoneNoNormalize = phoneNoTransform(body.phoneNo);
  if (!phoneNoValidator(phoneNoNormalize)) {
    return next('INVALID_PHONE_NUMBER');
  } 

  const org = await models.Org.findByPk(body.orgId);
  if (!org) {
    return next('ORG_ID_NOT_EXISTS');
  }

  // * external account should not org DEF and HDO
  if (org.category === 'DEF' || org.category === 'HDO') {
    return next('ORG_INVALID');
  }

  const banned = await isBanned(body);
  if (banned) { 
    return next('BLOCK_USER'); 
  } 

  const checkEmailAndPhoneNoErrorCode = await checkEmailAndPhoneNo(body);
  if (checkEmailAndPhoneNoErrorCode) {
    return next(checkEmailAndPhoneNoErrorCode);
  }

  let role =
    Object.values(USER_PERMISSION).find((item) => body.role && body.role.toUpperCase() === item) ||
    USER_PERMISSION.admin;

  const status =
    Object.values(USER_STATUS).find((item) => body.status && body.status.toUpperCase() === item) || USER_STATUS.active;

  try {
    const savedUser = await models.UsersNew.create({
      accountId: body.accountId,
      name: body.name,
      dept: 'external',
      idEmailVerified: false,
      phoneNo: phoneNoNormalize,
      email: body.accountId,
      orgId: body.orgId,
      type: USER_TYPE.EXTERNAL,
      role,
      roleId: body.role,
      status,
    });

    const getUser = await models.UsersNew.findByPk(savedUser.id, {
      include: [
        {
          model: models.Role,
        },
      ], 
    });
 

    return response.status(HTTP_STATUS_CODE.CREATE).json({
      message: 'created',
      result: transformAdminUser(getUser),
    });
  } catch (error) {
    console.error(error.message || error);
    return next('ERROR_WHILE_CREATE_REQUEST_EXTERNAL_ACCOUNT');
  }
}

async function isBanned(payload) {
  const { count: existsUser } = await models.UsersNew.findAndCountAll({
      where: {
        type: 'ORG',
        status: 'BLOCK',
        accountId: payload.accountId
      },
  });
  return existsUser > 0;
}

async function checkEmailAndPhoneNo(payload) {
  const user = await models.UsersNew.findOne({
    where: {
      type: 'ORG',
      status: 'ACTIVE',
      [Op.and]: [
        { [Op.or]: [{ accountId: payload.accountId }, { email: payload.accountId }, { phoneNo: payload.phoneNo }] },
        { deletedAt: null },
      ],
    },
  });

  if (!user) {
    return '';
  }

  if (user.email === payload.accountId) {
    return 'EMAIL_IS_EXISTS';
  }

  if (user.phoneNo === payload.phoneNo) {
    return 'PHONE_NUMBER_IS_EXISTS';
  }

  return '';
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
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

  if (error === 'ORG_ID_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '협력사 정보가 필요합니다.',
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

  if (error === 'ORG_INVALID') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '오류가 발생하였습니다.',
    });
  }

  if (error === 'EMAIL_IS_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일이 사용되었습니다',
    });
  }

  if (error === 'PHONE_NUMBER_IS_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 사용중인 휴대폰번호입니다.',
    });
  }

  if (error === 'ERROR_WHILE_CREATE_REQUEST_EXTERNAL_ACCOUNT') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '오류가 발생하였습니다.',
    });
  }

  next();
}

module.exports = { USER_PERMISSION, requestCreateAccount };
