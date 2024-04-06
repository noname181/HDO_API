const models = require('../../../../models');
const { IAuthUser, TokenService, USER_TYPE } = require('../../../../util/tokenService');
const { USER_STATUS } = require('../../../../controllers/mobileControllers/auth/loginByAccountId/loginByAccountId');
const { Op } = require('sequelize');
const {
  accountIdValidator,
  passwordValidator,
  emailValidator,
  phoneNoTransform,
  phoneNoValidator,
} = require('../../../../util/validators');
const { BadRequestException } = require('../../../../exceptions/badRequest.exception');
const { getUnpaidPaymentByUserId } = require('../../../../util/getUnpaidPaymentByUserId');

async function checkExists(type, id, condition) {
  const existsUser = await models.UsersNew.count({
    where: {
      type,

      id: {
        [Op.ne]: id,
      },
      status: {
        [Op.in]: ['ACTIVE', 'BLOCK'],
      },
      ...condition,
    },
  });
  return existsUser > 0;
}

const validateUpdate = async (user, body) => {
  try {
    if (!user) {
      return 'USER_IS_NOT_EXISTS';
    }

    if (!user.type || !Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type)) {
      return 'ERROR_UPDATE';
    }

    const userStatus = [USER_STATUS.active, USER_STATUS.block, USER_STATUS.sleep];
    const status = body.status && userStatus.includes(body.status.toString().toUpperCase());
    if (body.status && !status) {
      return 'USER_STATUS_INVALID';
    }
    const getUnpaidPayment = await getUnpaidPaymentByUserId(user.id, models);
    const hasUnpaidPayment = body.status && body.status.toUpperCase() === USER_STATUS.sleep && getUnpaidPayment;
    if (hasUnpaidPayment) {
      throw new BadRequestException(
        '미결제 건이 있습니다. 미결제건이 처리 완료되어야 탈퇴가 가능합니다',
        'USER_HAS_UNPAID_PAYMENT'
      );
    }

    const email = body?.email?.toString().trim();
    if (user.type === 'MOBILE' && !emailValidator(email)) {
      return 'INVALID_EMAIL';
    }

    const phoneNo = body.phoneNo?.toString().trim().replace(/-/g, '') || '';
    const phoneNoNormalize = phoneNoTransform(phoneNo);
    if (user.type !== 'HDO' && !phoneNoValidator(phoneNoNormalize)) {
      return 'INVALID_PHONE_NUMBER';
    }

    if (user.type === 'MOBILE' && email) {
      const checkEmail = await checkExists(user.type, user.id, { email });
      if (checkEmail) {
        return 'EMAIL_IS_EXISTS';
      }
    }

    if (user.type !== 'HDO' && phoneNoNormalize) {
      const checkPhoneNo = await checkExists(user.type, user.id, { phoneNo: phoneNoNormalize });
      if (checkPhoneNo) {
        return 'PHONE_NUMBER_IS_EXISTS';
      }
    }

    return false;
  } catch (error) {
    console.log('error::::::::::::', error);
    return 'ERROR_UPDATE';
  }
};

exports.validateUpdate = validateUpdate;
