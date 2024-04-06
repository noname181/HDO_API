'use strict';
const models = require('../../../../models');

const syncUserFromSapPerson = {
  path: '/user/sync/sap-person',
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
    await models.sequelize.query('CALL Proc_Insert_AND_Update_Users_News_From_Sap_People()');

    _response.json({
      result: 200,
      message: 'sync sap_persons to UsersNews successful',
    });
  } catch (e) {
    next('ERROR_SYNC_USER_SAP_PERSONS');
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'ERROR_SYNC_USER_SAP_PERSONS') {
    _response.error.notFound(_error, 'ERROR_SYNC_USER_SAP_PERSONS.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

module.exports = { syncUserFromSapPerson };
