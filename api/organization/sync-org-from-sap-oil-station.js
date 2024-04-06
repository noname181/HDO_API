'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/orgs/sync/oilstation',
  method: 'get',
  checkToken: false,
  roles: [],
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    await models.sequelize.query('CALL Proc_Insert_AND_Update_Data_From_Sap_Oil_Station()');

    _response.json({
      result: 200,
      message: 'sync sap_oilstation_tb to orgs successful',
    });
  } catch (e) {
    next('ERROR_SYNC_ORG_FROM_OILSTATION');
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'ERROR_SYNC_ORG_FROM_OILSTATION') {
    _response.error.notFound(_error, 'ERROR_SYNC_ORG_FROM_OILSTATION.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
