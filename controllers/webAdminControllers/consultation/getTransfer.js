const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');

const getTransfer = {
  path: '/web/cs-transfer',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const csId = request.query.csId || null;
  const id = request.query.id || null;
  let usersQueryDb = [];
  if (csId) {
    usersQueryDb.push({
      [Op.and]: [{ csId }],
    });
  }
  if (id) {
    usersQueryDb.push({
      [Op.and]: [{ id }],
    });
  }
  const whereClause = {
    [Op.and]: usersQueryDb,
  };
  const transfers = await models.CsTransfer.findAll({
    where: {
      [Op.and]: whereClause,
    },
  });
  return response.status(HTTP_STATUS_CODE.OK).json(transfers);
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getTransfer };
