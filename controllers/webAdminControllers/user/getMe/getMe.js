const models = require('../../../../models');
const { USER_ROLE } = require('../../../../middleware/role.middleware');
const { transformUser } = require('../../../mobileControllers/user/transformUser/transformUser');
const { USER_TYPE } = require('../../../../util/tokenService');
const { responseFields } = require('../getUsers/getUsers');
const { transformAdminUser } = require('../transformAdminUser/transformAdminUser');
const { transformResponse } = require('../../permissions/listRoles/listRoles');

const getMe = {
  path: '/admin/users/me',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
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
        model: models.SAP_Person,
        foreignKey: 'accountId',
        attributes: { exclude: ['deletedAt'] },
        as: 'SAP_Person',
      },
      {
        model: models.Role,
      },
    ],
  });

  if (!user) {
    return next('USER_IS_NOT_FOUND');
  }

  const transformUser = transformAdminUser(user);
  const transformRole = transformResponse(user.Role);

  const userRes = {
    ...transformUser,
    role: transformRole,
  };

  return response.status(200).json(userRes);
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  console.log('error::', error);
  if (error === 'USER_IS_NOT_FOUND') {
    return response.error.notFound(error, '해당 회원의 데이터가 존재하지 않습니다.');
  }

  next();
}

module.exports = { getMe };
