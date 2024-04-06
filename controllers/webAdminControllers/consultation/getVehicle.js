const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');

const getVehicle = {
  path: '/web/cs-vehicle',
  method: 'get',
  checkToken: false, //TESTONLY
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const usersNewId = request.query.usersNewId;
  const vehicle = await models.Vehicle.findOne({
    where: {
      [Op.and]: [
        {
          usersNewId,
        },
        { isPrimary: true },
      ],
    },
  });
  return response.status(HTTP_STATUS_CODE.OK).json(vehicle);
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getVehicle };
