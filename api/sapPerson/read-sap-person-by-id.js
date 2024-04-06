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
    attributes: { 
      include: [
          [models.sequelize.fn('TRIM', models.sequelize.col('DPT')), 'DPT'],
          [models.sequelize.fn('TRIM', models.sequelize.col('DPT1')), 'DPT1'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('EMAIL')), 'EMAIL'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('ENAME')), 'ENAME'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('JKG')), 'JKG'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('JKG1')), 'JKG1'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('JKW')), 'JKW'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('JKW1')), 'JKW1'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('ORG')), 'ORG'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('ORG1')), 'ORG1'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('PERNR')), 'PERNR'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('PHONE')), 'PHONE'], 
          [models.sequelize.fn('TRIM', models.sequelize.col('PHONE2')), 'PHONE2'],  
      ],
      exclude: ['PASSWORD', 'deletedAt'] },
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
