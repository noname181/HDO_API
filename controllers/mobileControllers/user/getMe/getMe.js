const { transformUser } = require('../transformUser/transformUser');
const { USER_ROLE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { USER_TYPE } = require('../../../../util/tokenService');
const { responseFields } = require('../../../webAdminControllers/user/getUsers/getUsers');
const sequelize = require('sequelize');
const Op = sequelize.Op;

const getMe = {
  path: '/mobile/users/me',
  method: 'get',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { user: authUser } = request;
  const user = await models.UsersNew.findOne({
    where: { id: authUser.id },
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
        model: models.UserOauth,
        as: 'userOauths',
        foreignKey: 'usersNewId',
        attributes: ['provider'],
      },
      {
        model: models.sb_charging_log,
        foreignKey: 'usersNewId',
        attributes: ['chg_id', 'chgs_id'],
        as: 'chargingLog',
        where: {
          cl_unplug_datetime: {
            [Op.is]: null,
          },
          reason: { [Op.or]: [{ [Op.ne]: 'Other' }, { [Op.is]: null }] },
        },
        order: [['cl_id', 'DESC']],
        limit: 1,
      },
    ],
  });

  if (!user) {
    return next('USER_IS_NOT_FOUND');
  }

  user.connectedSns = [];
  if (user.userOauths) {
    const connectedSns = user.userOauths.map((ele) => ele.provider);
    user.connectedSns.push(...connectedSns);
  }

  if (user.deviceId) {
    user.connectedSns.push('BIO');
  }

  await user.update({
    lastOnline: new Date(),
  });

  const userType = Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type) || USER_TYPE.MOBILE;
  const userRes = transformUser({
    fields: responseFields[userType],
    user,
  });

  return response.status(200).json(userRes);
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'USER_IS_NOT_FOUND') {
    return response.error.notFound(error, '해당 회원의 데이터가 존재하지 않습니다.');
  }

  next();
}

module.exports = { getMe };
