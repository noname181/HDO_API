const { HTTP_STATUS_CODE, USER_ROLE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { USER_TYPE } = require('../../../../util/tokenService');
const { responseFields } = require('../getUsers/getUsers');
const { transformUser } = require('../../../mobileControllers/user/transformUser/transformUser');
const { phoneNoValidator } = require('../../../../util/validators');
const { PasswordService } = require('../../../../util/passwordService');
const { PERMISSION } = require('../../../../middleware/permission.middleware');
const { Op } = require('sequelize');
const { PERMISSION_NAME } = require('../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../middleware/newRole.middleware');
const { transformAdminUser } = require('../transformAdminUser/transformAdminUser');
const { validateUpdate } = require('../../../webAdminControllers/auth/update/validateUpdate');

const updateUserByAdmin = {
  path: '/web/users/:id',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { params, user: authUser, body, privateView = false } = request;
  try {
    const userId = params.id.toString().trim();
    const user = await models.UsersNew.findByPk(userId);
    const validationError = await validateUpdate(user, body);
    if (!validationError) {
      let status =
        Object.values(USER_STATUS).find((item) => item === user.status.toString().toUpperCase()) || user.status;
      if (body.status) {
        status =
          Object.values(USER_STATUS).find((item) => item === body.status.toString().toUpperCase()) || user.status;
      }

      let role = Object.values(USER_ROLE).find((item) => item.toUpperCase() === user.role) || user.role;
      if (body.role) {
        Object.values(USER_ROLE).find((item) => item.toUpperCase() === user.role) || user.role;
      }

      let saltRounds;
      let hashPassword;
      let userUpdateInput;
      if (body.password) {
        const passwordService = new PasswordService(config);
        const { salt, passwordHashed } = await passwordService.hash(body.password);
        saltRounds = salt;
        hashPassword = passwordHashed;
      }

      const userType = Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type) || USER_TYPE.MOBILE;

      if (userType === USER_TYPE.HDO) {
        userUpdateInput = {
          status,
          roleId: body.role,
        };
        if (body.accountId) {
          const sapPerson = await models.SAP_Person.findByPk(body.accountId);
          if (sapPerson) {
            userUpdateInput.md5Password = sapPerson.dataValues.PASSWORD;
          } else {
            return next('ACCOUNT_NOT_EXISTS');
          }
        }
      }

      if (userType === USER_TYPE.EXTERNAL) {
        userUpdateInput = {
          status,
          name: body.name && body.name !== user.name ? body.name : undefined,
          phoneNo: body.phoneNo && body.phoneNo !== user.phoneNo ? body.phoneNo : undefined,
          roleId: body.role,
        };
      }

      if (userType === USER_TYPE.MOBILE) {
        userUpdateInput = {
          status,
          name: body.name && body.name !== user.name ? body.name : undefined,
          phoneNo: body.phoneNo && body.phoneNo !== user.phoneNo ? body.phoneNo : undefined,
          hashPassword,
          saltRounds,
          // accountId: body.accountId && body.accountId !== user.accountId ? body.accountId : undefined,
          email: body.email && body.email !== user.email ? body.email : undefined,
          birth: body.birth && body.birth !== user.birth ? body.birth : undefined,
          gender: body.gender && body.gender !== user.gender ? body.gender : undefined,
          address: body.address && body.address !== user.address ? body.address : undefined,
          detailAddress:
            body.detailAddress && body.detailAddress !== user.detailAddress ? body.detailAddress : undefined,
          zipCode: body.zipCode && body.zipCode !== user.zipCode ? body.zipCode : undefined,
          deletedAt: status === 'SLEEP' ? new Date() : undefined,
        };
      }
     
      await models.UsersNew.update(
        { ...userUpdateInput, updatedAt: new Date() },
        {
          where: {
            id: userId,
          },
        }
      );
      
      if (userType === USER_TYPE.MOBILE && status === 'SLEEP'){
        return response.status(HTTP_STATUS_CODE.OK).json();
      }

      const userUpdated = await user.reload({
        include: [
          {
            model: models.Org,
            foreignKey: 'orgId',
            attributes: { exclude: ['deletedAt'] },
          },
          {
            model: models.Vehicle,
            foreignKey: 'usersNewId',
            attributes: { exclude: ['deletedAt'] },
            as: 'vehicles',
          },
          {
            model: models.PayMethod,
            foreignKey: 'usersNewId',
            attributes: { exclude: ['deletedAt'] },
            as: 'payMethods',
          },
          {
            model: models.Role,
          },
        ],
      });
      const result = transformAdminUser(userUpdated, privateView);
      return response.status(HTTP_STATUS_CODE.OK).json(result);
    } else {
      return next(validationError || 'ERROR_UPDATE');
    }
  } catch (error) {
    return next('ERROR_UPDATE');
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'USER_STATUS_INVALID') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'status should is active or block',
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

  if (error === 'USER_IS_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '회원이 없습니다.',
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

  // if (error === 'ACCOUNT_ID_IS_EXISTS') {
  //   return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
  //     errorCode: error,
  //     timestamp: new Date().toISOString(),
  //     path: request.url,
  //     message: '계정 Id가 존재합니다.',
  //   });
  // }

  if (error === 'EMAIL_IS_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일이 사용되었습니다.',
    });
  }

  if (error === 'ERROR_UPDATE') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '미결제 건이 있습니다. 미결제건이 처리 완료되어야 탈퇴가 가능합니다.',
    });
  }

  if (error === 'ACCOUNT_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'sap에서 연계된 hdo회원정보가 없습니다. 다시 확인해주세요.',
    });
  }

  next(error);
}

const USER_STATUS = {
  active: 'ACTIVE',
  sleep: 'SLEEP',
  block: 'BLOCK',
  retired: 'RETIRED',
};

module.exports = { updateUserByAdmin, USER_STATUS };
