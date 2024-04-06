const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');

const getScript = {
  path: '/web/cs-script',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const id = request.query.id || null;
  const orderByQueryParam = (request.query.odby ? request.query.odby : 'DESC').toUpperCase();

  let usersQueryDb = [];
  if (id) {
    usersQueryDb.push({
      [Op.and]: [{ id }],
    });
  }
  const whereClause = {
    [Op.and]: usersQueryDb,
  };
  const { count: totalCount, rows: scripts } = await models.CsScript.findAndCountAll({
    where: {
      [Op.and]: whereClause,
    },
    order: [['id', orderByQueryParam]],
  });
  return response.status(HTTP_STATUS_CODE.OK).json({ totalCount, scripts });
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getScript };
