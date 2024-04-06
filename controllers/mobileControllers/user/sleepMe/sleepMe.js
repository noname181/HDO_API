const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { USER_TYPE } = require('../../../../util/tokenService');
const { responseFields } = require('../../../webAdminControllers/user/getUsers/getUsers');
const { USER_STATUS } = require('../../auth/loginByAccountId/loginByAccountId');
const { transformUser } = require('../transformUser/transformUser');
const { BadRequestException } = require('../../../../exceptions/badRequest.exception');
const { ConflictException } = require('../../../../exceptions/conflict.exception');
const { getUnpaidPaymentByUserId } = require('../../../../util/getUnpaidPaymentByUserId');

const sleepMe = {
  path: '/mobile/users/sleep',
  method: 'post',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response) {
  const { user: authUser, body } = request;
  const status = body.status
    ? Object.values(USER_STATUS).find((item) => item === body.status.toUpperCase())
    : USER_STATUS.sleep;

  if (!status || status !== 'SLEEP') {
    throw new BadRequestException('유효하지 않은 값입니다.', 'STATUS_INCORRECT');
  }

  const user = await models.UsersNew.findByPk(authUser.id, {
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
    ],
  });

  if (!user || user.status.toUpperCase() === USER_STATUS.sleep) {
    throw new BadRequestException('회원이 없습니다.', 'USER_NOT_EXISTS');
  }

  const hasUnpaidPayment = await getUnpaidPaymentByUserId(user.id, models);
  if (hasUnpaidPayment) {
    throw new BadRequestException(
      '미결제 건이 있습니다. 미결제건이 처리 완료되어야 탈퇴가 가능합니다',
      'USER_HAS_UNPAID_PAYMENT'
    );
  }

  const userType = Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type) || USER_TYPE.MOBILE;

  try {
    await models.UsersNew.update({ status, deletedAt: new Date() }, { where: { id: user.id } });
    await models.UserOauth.destroy({
      where: {
        usersNewId: user.id,
      },
      force: true,
    });

    const userUpdated = await models.UsersNew.findByPk(user.id, {
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
      ],
      paranoid: false,
    });

    const userRes = transformUser({
      fields: responseFields[userType],
      user: userUpdated,
    });

    return response.status(HTTP_STATUS_CODE.OK).json(userRes);
  } catch (e) {
    throw new ConflictException('업데이트 하는 동안 에러가 발생했습니다.', 'ERROR_WHILE_UPDATE_USER');
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next(error);
}

module.exports = { sleepMe };
