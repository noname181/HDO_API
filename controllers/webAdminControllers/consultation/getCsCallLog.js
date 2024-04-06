const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const Sequelize = require('sequelize');

const getCsCallLog = {
  path: '/web/cs-call-logs',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const regNo = request.query.regNo;
  try {
    const callLogs = await models.sequelize.query(
      `SELECT regNo
      , IF(csEvent = 'Bridge', MIN(createdAt),'') AS start_time
      , IF(csEvent = 'Hangup', '',MAX(createdAt)) AS end_time
      , IF(MAX(callType) = 1,'인입 전화','후속 전화') AS callType
      , MAX(recordFile) AS recordFile
      , (SELECT name FROM UsersNews WHERE id = ccl.agentId) AS agentName
      FROM CsCallLogs ccl
      WHERE 1=1
      AND regNo = :regNo
      AND csEvent IN ('Bridge', 'Hangup')
      GROUP BY regNo, uniqueId
      ORDER BY uniqueId
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { regNo: regNo },
        nest: true,
      }
    );
    return response.status(HTTP_STATUS_CODE.OK).json(callLogs);
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

module.exports = { getCsCallLog };
