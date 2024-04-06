const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { USER_TYPE } = require('../../../../util/tokenService');
const { transformUser } = require('../../../mobileControllers/user/transformUser/transformUser');
const { responseFields } = require('../getUsers/getUsers');
const { PERMISSION_NAME } = require('../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../middleware/newRole.middleware');
const { transformAdminUser } = require('../transformAdminUser/transformAdminUser');

const getUserById = {
  path: '/web/users/:id',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  status: 'PRIVATE',
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { params, privateView = false } = request;

  const userId = params.id.toString().trim() || '';

  const user = await models.UsersNew.findByPk(userId, {
    include: [
      {
        model: models.Org,
        foreignKey: 'orgId',
        attributes: { exclude: ['deletedAt'] },
      },
      {
        model: models.SAP_Person,
        attributes: { exclude: ['deletedAt'] },
      },
      {
        model: models.Vehicle,
        foreignKey: 'usersNewId',
        attributes: { exclude: ['deletedAt'] },
        as: 'vehicles',
      },
      {
        model: models.UserOauth,
        foreignKey: 'usersNewId',
        attributes: { exclude: ['deletedAt'] },
        as: 'userOauths',
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

  if (!user) {
    return next('USER_IS_NOT_FOUND');
  }

  const userType = Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type) || USER_TYPE.MOBILE;
  const result = transformAdminUser(user, privateView);

  return response.status(HTTP_STATUS_CODE.OK).json(result);
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'USER_IS_NOT_FOUND') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '회원이 없습니다.',
    });
  }
  next();
}

module.exports = { getUserById };
