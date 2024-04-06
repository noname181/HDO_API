const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../../util/tokenService');
const models = require('../../../../models');
const { Op } = require('sequelize');
const { transformUser } = require('../../../mobileControllers/user/transformUser/transformUser');
const { responseFields } = require('../../user/getUsers/getUsers');
const { transformAdminUser } = require('../../user/transformAdminUser/transformAdminUser');
const { PERMISSION_NAME } = require('../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../middleware/newRole.middleware');

const getUserExternalByOrgId = {
  path: '/web/orgs/:id/users',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.client],
  permissions: [PERMISSIONS.list, PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { query, params } = request;
  const { page, rpp } = query;
  const orgId = params.id.toString().trim();
  const userType = USER_TYPE.EXTERNAL;

  let offset;
  let limit;
  if (page && rpp) {
    const paging = parseInt(page) || 1;
    limit = parseInt(rpp) || 50;
    offset = (paging - 1) * limit;
  }

  const { count: totalCount, rows: users } = await models.UsersNew.findAndCountAll({
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    where: {
      [Op.and]: [
        {
          type: userType.toUpperCase(),
        },
        {
          orgId,
        },
        {
          isEmailVerified: true,
        },
      ],
    },
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

  const userRes = users.map((item) => transformAdminUser(item,false));
  return response.status(HTTP_STATUS_CODE.OK).json({
    totalCount,
    result: userRes,
  });
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getUserExternalByOrgId };
