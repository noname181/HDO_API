/**
 * Created by Sarc bae on 2023-05-26.
 * 소속 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const {
  addressMask,
  phoneNoMask,
  emailMask,
  nameMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { getOrgsService } = require('../../controllers/webAdminControllers/org/getOrgs/getOrgs.service');

module.exports = {
  path: ['/orgs'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: getOrgsService,
  validator: validator,
  errorHandler: errorHandler,
};

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  next(_error);
}
