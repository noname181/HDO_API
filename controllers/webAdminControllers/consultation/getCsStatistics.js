const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const Sequelize = require('sequelize');

const getCsStatistics = {
  path: '/web/cs-statistics',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const agentId = request.query.agentId;
  const consultantId = request.query.consultantId;
  try {
    const statistics = await models.sequelize.query(
      `SELECT coalesce(Ringing,0) AS Ringing, coalesce(Bridge,0) AS Bridge
      , coalesce(FailCall,0) AS FailCall, coalesce(HOL,0) AS HOL
      , coalesce(APR,0) AS APR, coalesce(COM,0) AS COM
      , coalesce(TRA,0) AS TRA
      FROM (
        SELECT Ringing, Bridge + Pickup AS Bridge, Ringing - Bridge + Pickup AS FailCall
        FROM (
          SELECT 
           SUM(CASE WHEN csEvent = 'Ringing' THEN 1 ELSE 0 END) as Ringing
           ,SUM(CASE WHEN csEvent = 'Bridge' THEN 1 ELSE 0 END) as Bridge
           ,SUM(CASE WHEN csEvent = 'Pickup' THEN 1 ELSE 0 END) as Pickup
          FROM CsCallLogs
          WHERE 1=1
          AND extensionNumber = :agentId
          AND DATE(createdAt) = CURDATE()
        ) A
      ) A, (
        SELECT 
         SUM(CASE WHEN statusCd IN ('HOL', 'RCT') THEN 1 ELSE 0 END) as HOL
         ,SUM(CASE WHEN statusCd IN('APR', 'REF', 'ARR', 'RER') THEN 1 ELSE 0 END) as APR
         ,SUM(CASE WHEN statusCd = 'COM' THEN 1 ELSE 0 END) as COM
         ,SUM(CASE WHEN statusCd = 'TRA' THEN 1 ELSE 0 END) as TRA
        FROM Consultations
        WHERE 1=1
        AND consultantId = :consultantId
        AND DATE(createdAt) = CURDATE()
      ) B
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { agentId: agentId, consultantId: consultantId },
        nest: true,
      }
    );
    return response.status(HTTP_STATUS_CODE.OK).json(statistics);
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

module.exports = { getCsStatistics };
