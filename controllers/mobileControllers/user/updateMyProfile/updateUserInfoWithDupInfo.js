const { configuration } = require('../../../../config/config');
const { HTTP_STATUS_CODE, USER_ROLE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { emailValidator } = require('../../../../util/validators');
const { PasswordService } = require('../../../../util/passwordService');
const { USER_TYPE } = require('../../../../util/tokenService');
const { responseFields } = require('../../../webAdminControllers/user/getUsers/getUsers');
const { transformUser } = require('../transformUser/transformUser');
const { Op } = require('sequelize');

const updateUserInfoWithDupInfo = {
  path: '/users/dupinfo',
  method: 'put',
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { user: authUser, body: payload } = request;

  try {
 
      const findUserQuery = [];

      if (payload.accountId && payload.dupinfo) {
        findUserQuery.push({
          [Op.and]: [
            {
              dupinfo: payload?.dupinfo,
            },
            {
              accountId: payload?.accountId,
            },
          ],
        });
      }

      if (payload.phoneNo && payload.dupinfo) {
        findUserQuery.push({
          [Op.and]: [
            {
              dupinfo: payload?.dupinfo,
            },
            {
              phoneNo: payload?.phoneNo,
            },
          ],
        }); 
      }

      if (!findUserQuery || findUserQuery.length === 0) {
        throw 'INVALID_PAYLOAD';
      }

      // const user = await models.UsersNew.findOne({
      //   where: {
      //     [Op.or]: findUserQuery,
      //   },
      // });
      const user = await models.UsersNew.findOne({
        where: {
          [Op.or]: findUserQuery,
          type: 'MOBILE', 
        }, 
      }); 

      if (!user) {
        throw 'USER_IS_NOT_EXISTS';
      }
      
      if (user.status === 'BLOCK') {
        throw 'BLOCK_USER';
      }
      
      const phoneNoExists = payload.phoneNo
        ? await models.UsersNew.count(
            {
              where: {
                type: 'MOBILE',
                id: {
                  [Op.ne]: user.id,
                },
                status: {
                  [Op.in]: ['ACTIVE', 'BLOCK'],
                },
                phoneNo: payload.phoneNo,
              },
            }, 
          )
        : null;
      if (phoneNoExists) {
        throw 'PHONE_NUMBER_IS_EXISTS';
      }

      const emailExists = payload.email
        ? await models.UsersNew.count(
            {
              where: {
                type: 'MOBILE',
                id: {
                  [Op.ne]: user.id
                },
                status: {
                  [Op.in]: ['ACTIVE', 'BLOCK'],
                },
                email: payload.email,
              },
            }, 
          )
        : null;
      if (emailExists) {
        throw 'EMAIL_IS_EXISTS';
      } 

      const userUpdateInput = {
       // accountId: payload.accountId || user.accountId,
        phoneNo: payload.phoneNo && payload.phoneNo !== user.phoneNo ? payload.phoneNo : undefined,
        email: payload.email && payload.email !== user.email ? payload.email : undefined,
        dupinfo: payload.dupinfo && payload.dupinfo !== user.dupinfo ? payload.dupinfo : undefined,
        updatedAt: new Date(),
      };

      if (payload.password) {
        const config = configuration();
        const passwordService = new PasswordService(config);
        const { salt, passwordHashed } = await passwordService.hash(payload.password);
        userUpdateInput.salt = salt;
        userUpdateInput.hashPassword = passwordHashed;
      } 

      await models.UsersNew.update(
        userUpdateInput,
        {
          where: {
            id: user.id,
          },
        }, 
      );

    const userUpdated = await user.reload();

    const userType =
      Object.values(USER_TYPE).find((item) => item.toUpperCase() === userUpdated.type) || USER_TYPE.MOBILE;
     
    return response.status(HTTP_STATUS_CODE.OK).json(transformUser({
      fields: responseFields[userType],
      user: userUpdated,
    }));
  } catch (error) {
    if (error instanceof Error) {
      return next('ERROR_UPDATE');
    }

    return next(error);
  }
}

function validator(request, response, next) {
  const { body } = request;

  const accountId = body.accountId?.toString().trim() || '';
  const isAccountId = accountIdValidator(accountId);
  const isAccountEmail = emailValidator(accountId);
  const isValidAccountId = isAccountId || isAccountEmail;
  if (accountId && !isValidAccountId) {
    return 'INVALID_ACCOUNT_ID';
  }

  const phoneNo = body.phoneNo?.toString().trim().replace(/-/g, '') || '';
  const isPhoneNo = phoneNoValidator(phoneNo);
  if (phoneNo && !isPhoneNo) {
    return 'INVALID_PHONE_NUMBER';
  }

  const password = body.password?.toString() || '';
  const isPassword = passwordValidator(password);
  if (password && !isPassword) {
    return 'INVALID_PASSWORD';
  }

  const email = body.email?.toString() || '';
  const isEmail = emailValidator(email);
  if (email && !isEmail) {
    return 'INVALID_EMAIL';
  }

  request.body = {
    ...body,
    password,
    phoneNo,
    accountId,
    password,
    email,
  };
  next();
}

function errorHandler(error, request, response, next) {

  if (error === 'BLOCK_USER') { 
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '로그인 오류!(블락된 사용자).',
    });
  }

  if (error === 'INVALID_ACCOUNT_ID') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '계정 ID가 잘못되었습니다.',
    });
  }

  if (error === 'INVALID_PHONE_NUMBER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유효하지 않은 전화번호입니다',
    });
  }

  if (error === 'INVALID_PASSWORD') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '비밀번호가 유효하지 않습니다',
    });
  }

  if (error === 'INVALID_EMAIL') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일이 잘못되었습니다.',
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

  if (error === 'ACCOUNT_ID_IS_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 사용중인 아이디입니다.',
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

  if (error === 'EMAIL_IS_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일이 사용되었습니다',
    });
  }

  if (error === 'ERROR_UPDATE') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '업데이트 하는 동안 에러가 발생했습니다.',
    });
  }

  next();
}

const accountIdValidator = (accountId) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/g;
  return regex.test(accountId);
};

const phoneNoValidator = (phoneNo) => {
  const regex = /^[0-9]+$/g;
  return regex.test(phoneNo);
};

const passwordValidator = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z!@#$%^&*\d]{8,12}$/g;
  return regex.test(password);
};

module.exports = { updateUserInfoWithDupInfo, phoneNoValidator };
