const { Op } = require('sequelize');
const { HTTP_STATUS_CODE, USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/get_sap_person',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { page, rpp, odby, search } = request.query;

  const paging = parseInt(page) || 1;
  const limit = parseInt(rpp) || 50;
  const offset = (paging - 1) * limit;
  const orderBy = (odby ? odby : 'DESC').toUpperCase();

  const persons = await models.SAP_Person.findAndCountAll({
    where: {
      [Op.and]: [
        models.sequelize.literal(
          'NOT EXISTS (SELECT 1 FROM UsersNews WHERE UsersNews.accountId = SAP_Person.PERNR AND UsersNews.deletedAt IS NULL)'
        ),
        { ENAME: { [Op.like]: `%${search ? search : ''}%` } },
      ],
    },
    attributes: { exclude: ['PASSWORD', 'deletedAt'] },
    offset,
    limit,
  });

  return response.status(HTTP_STATUS_CODE.OK).json({ result: persons });
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}
