const models = require('../../../models');
const Sequelize = require('sequelize');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');

const getAsOrg = {
  path: '/web/getAsOrg',
  method: 'get',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  try {
    const asOrg = await models.sequelize.query(
      `
     SELECT id, category, name
     FROM Orgs WHERE category = 'AS' 
     `,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    return response.status(HTTP_STATUS_CODE.OK).json(asOrg);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    response.status(500).json({ message: 'Internal server error' });
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getAsOrg };
