const { HTTP_STATUS_CODE, USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/get_sap_person/:id',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { params } = request;

  const personId = params.id.toString().trim() || '';

  const person = await models.SAP_Person.findByPk(personId, {
    attributes: { exclude: ['PASSWORD', 'deletedAt'] },
  });

  if (!person) {
    return next('PERSON_IS_NOT_FOUND');
  }

  return response.status(HTTP_STATUS_CODE.OK).json({ result: person });
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'PERSON_IS_NOT_FOUND') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '회원이 없습니다.',
    });
  }
  next();
}
