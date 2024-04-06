const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const Sequelize = require('sequelize');

const getCsDashBoard = {
  path: '/web/cs-dashBoard',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const selectedDate = request.query?.selectedDate ? request.query.selectedDate : null;

  try {
    const dashBoardGridData = await models.sequelize.query(
      `SELECT
      MAX(logData.id) AS id,
      logData.agentId,
      logData.extensionNumber,
      userData.name AS agentName,
      nowState.csState,
      SUM(CASE WHEN logData.csEvent = 'Bridge' THEN 1 ELSE 0 END) AS BridgeCount,
      COALESCE(messageData.messageCount, 0) AS messageCount,
      COALESCE(refundData.refundCount, 0 ) AS refundCount,
      COALESCE(refundData.totalCancelAmount, 0)AS refundAmount,
      DATE(logData.createdAt) AS logDate
    FROM 
      CsCallLogs AS logData
    LEFT OUTER JOIN ( SELECT id, csState FROM CsCallLogs ) AS nowState ON ( logData.id = nowState.id )
    LEFT OUTER JOIN ( SELECT id, NAME FROM UsersNews ) AS userData ON ( logData.agentId = userData.id )
    LEFT OUTER JOIN ( 
        SELECT COUNT(*) AS messageCount, csId, DATE(createdAt) AS createdAt
        FROM messageLog 
        GROUP BY csId,DATE(createdAt)
    ) AS messageData ON (logData.agentId = messageData.csId && DATE(logData.createdAt) = DATE(messageData.createdAt))
    LEFT OUTER JOIN ( SELECT
            userId AS userId,
            DATE(createdAt) AS date,
            SUM(cancelAmount) AS totalCancelAmount,
            COUNT(userId) AS refundCount
            FROM RequestRefunds
            GROUP BY DATE(createdAt), userId ) 
              AS refundData ON (logData.agentId = refundData.userId && DATE(logData.createdAt) = DATE(refundData.date))
    WHERE DATE(logData.createdAt) = DATE(:selectedDate)
    GROUP BY 
      logData.agentId,
      DATE(logData.createdAt);
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { selectedDate: selectedDate },
        nest: true,
      }
    );

    const dashBoardTimeData = await models.sequelize.query(
      `SELECT 
      hourBlocks.hourBlock,
      COALESCE(SUM(CASE WHEN csEvent = 'Ringing' THEN 1 ELSE 0 END), 0) AS ringingCount,
      COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) AS hangupCount
    FROM (
      SELECT '00:00' AS hourBlock UNION
      SELECT '01:00' AS hourBlock UNION
      SELECT '02:00' AS hourBlock UNION
      SELECT '03:00' AS hourBlock UNION
      SELECT '04:00' AS hourBlock UNION
      SELECT '05:00' AS hourBlock UNION
      SELECT '06:00' AS hourBlock UNION
      SELECT '07:00' AS hourBlock UNION
      SELECT '08:00' AS hourBlock UNION
      SELECT '09:00' AS hourBlock UNION
      SELECT '10:00' AS hourBlock UNION
      SELECT '11:00' AS hourBlock UNION
      SELECT '12:00' AS hourBlock UNION
      SELECT '13:00' AS hourBlock UNION
      SELECT '14:00' AS hourBlock UNION
      SELECT '15:00' AS hourBlock UNION
      SELECT '16:00' AS hourBlock UNION
      SELECT '17:00' AS hourBlock UNION
      SELECT '18:00' AS hourBlock UNION
      SELECT '18:00' AS hourBlock UNION
      SELECT '19:00' AS hourBlock UNION
      SELECT '20:00' AS hourBlock UNION
      SELECT '21:00' AS hourBlock UNION
      SELECT '22:00' AS hourBlock UNION
      SELECT '23:00' AS hourBlock
    ) AS hourBlocks
    LEFT JOIN CsCallLogs ON hourBlocks.hourBlock = DATE_FORMAT(CsCallLogs.createdAt, '%H:00')
    AND DATE(CsCallLogs.createdAt) = DATE(:selectedDate)
    GROUP BY hourBlocks.hourBlock
    ORDER BY hourBlocks.hourBlock;
        `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { selectedDate: selectedDate },
        nest: true,
      }
    );

    const dashBoardConsultation = await models.sequelize.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN csClass LIKE '%%' THEN 1 ELSE 0 END), 0 ) as ALLCount,
        COALESCE(SUM(CASE WHEN csClass = 'CHG' THEN 1 ELSE 0 END), 0 ) as CHG,
        COALESCE(SUM(CASE WHEN csClass = 'BRK' THEN 1 ELSE 0 END), 0 ) as BRK,
        COALESCE(SUM(CASE WHEN csClass = 'PAY' THEN 1 ELSE 0 END), 0 ) as PAY,
        COALESCE(SUM(CASE WHEN csClass = 'REF' THEN 1 ELSE 0 END), 0 ) as REF,
        COALESCE(SUM(CASE WHEN csClass = 'CMC' THEN 1 ELSE 0 END), 0 ) as CMC,
        COALESCE(SUM(CASE WHEN csClass = 'ETC' THEN 1 ELSE 0 END), 0 ) as ETC
        FROM Consultations WHERE DATE(createdAt) = DATE(:selectedDate);
          `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { selectedDate: selectedDate },
        nest: true,
      }
    );

    return response.status(HTTP_STATUS_CODE.OK).json({
      gridData: dashBoardGridData,
      timeTable: dashBoardTimeData,
      consultation: dashBoardConsultation,
    });
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

module.exports = { getCsDashBoard };
