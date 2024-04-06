const { configuration } = require('../../../../config/config');
const { HTTP_STATUS_CODE, USER_ROLE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { PasswordService } = require('../../../../util/passwordService');
const { USER_TYPE } = require('../../../../util/tokenService');
const {
  accountIdValidator,
  phoneNoValidator,
  passwordValidator,
  emailValidator,
  phoneNoTransform,
} = require('../../../../util/validators');
const { responseFields } = require('../../../webAdminControllers/user/getUsers/getUsers');
const { USER_STATUS } = require('../../auth/loginByAccountId/loginByAccountId');
const { transformUser } = require('../transformUser/transformUser');
const { Op } = require('sequelize');

const updateMyProfile = {
  path: '/users',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { user: authUser, body: payload } = request;

  try {
    const user = await models.UsersNew.findByPk(authUser.id);

    if (!user) {
      return next('USER_IS_NOT_EXISTS');
    }

    if (user.status === 'SLEEP') {
      return next('SLEEP_USER');
    }

    if (user.status === 'BLOCK') {
      return next('BLOCK_USER');
    }

    const { phoneNo, email, birth, gender, address, detailAddress, zipCode } = payload;
    const errorPhoneNo = phoneNo && phoneNo !== user.phoneNo ? await checkPhoneNo(user.id, phoneNo) : '';
    if (errorPhoneNo) {
      throw errorPhoneNo;
    }

    const errorEmail = email && email !== user.email ? await checkEmail(user.id, email) : '';
    if (errorEmail) {
      throw errorEmail;
    }

    const userUpdateInput = {
      phoneNo: phoneNo !== user.phoneNo ? phoneNo : user.phoneNo,
      email: email !== user.email ? email : user.email,
      birth: birth !== user.birth ? birth : user.birth,
      gender: gender !== user.gender ? gender : user.gender,
      address: address !== user.address ? address : user.address,
      detailAddress: detailAddress !== user.detailAddress ? detailAddress : user.detailAddress,
      zipCode: zipCode !== user.zipCode ? zipCode : user.zipCode,
      updatedAt: new Date(),
    };

    if (payload.password) {
      const config = configuration();
      const passwordService = new PasswordService(config);
      const { salt, passwordHashed } = await passwordService.hash(payload.password);
      userUpdateInput.salt = salt;
      userUpdateInput.hashPassword = passwordHashed;
    }

    await models.UsersNew.update(userUpdateInput, {
      where: {
        id: user.id,
      },
    });

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
      ],
    });

    const userType =
      Object.values(USER_TYPE).find((item) => item.toUpperCase() === userUpdated.type) || USER_TYPE.MOBILE;

    return response.status(HTTP_STATUS_CODE.OK).json(
      transformUser({
        fields: responseFields[userType],
        user: userUpdated,
      })
    );
  } catch (error) {
    return next(error);
  }
}

function validator(request, response, next) {
  const { body } = request;

  const accountId = body.accountId?.toString().trim() || '';
  const isValidAccountIdRegex = accountIdValidator(accountId);
  if (accountId && !isValidAccountIdRegex) {
    throw 'INVALID_ACCOUNT_ID';
  }

  const email = body.email?.toString() || '';
  const isValidEmail = emailValidator(email);
  if (email && !isValidEmail) {
    throw 'INVALID_EMAIL';
  }

  const phoneNo = body.phoneNumber?.toString().trim() || '';
  const phoneNoNormalize = phoneNoTransform(phoneNo);
  const isValidPhoneNo = phoneNoValidator(phoneNoNormalize);
  if (phoneNo && !isValidPhoneNo) {
    throw 'INVALID_PHONE_NUMBER';
  }

  const password = body.password || '';
  const isValidPassword = passwordValidator(password);
  if (password && !isValidPassword) {
    throw 'INVALID_PASSWORD';
  }

  // request.body.accountId = accountId;
  // request.body.phoneNo = phoneNoNormalize;
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'INVALID_PHONE_NUMBER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유효하지 않은 전화번호입니다.',
    });
  }

  if (error === 'INVALID_PASSWORD') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '비밀번호가 유효하지 않습니다.',
    });
  }

  if (error === 'INVALID_EMAIL') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 사용중인 이메일입니다.',
    });
  }

  if (error === 'ALREADY_EXIST_EMAIL') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 사용중인 이메일입니다.',
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

  if (error === 'SLEEP_USER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 탈퇴한 회원입니다.',
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
      message: '이메일이 사용되었습니다.',
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

  next(error);
}

async function checkPhoneNo(id, phoneNo) {
  const user = await models.UsersNew.count({
    where: {
      type: 'MOBILE',
      id: {
        [Op.ne]: id,
      },
      status: {
        [Op.in]: ['ACTIVE', 'BLOCK'],
      },
      phoneNo,
    },
  });
  if (!user) {
    return '';
  }
  return 'PHONE_NUMBER_IS_EXISTS';
}

async function checkEmail(id, email) {
  const user = await models.UsersNew.count({
    where: {
      type: 'MOBILE',
      id: {
        [Op.ne]: id,
      },
      status: {
        [Op.in]: ['ACTIVE', 'BLOCK'],
      },
      email,
    },
  });
  if (!user) {
    return '';
  }
  return 'ALREADY_EXIST_EMAIL';
}

module.exports = { updateMyProfile };
