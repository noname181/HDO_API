const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const Sequelize = require('sequelize');

const getCallList = {
  path: '/web/cs-callList',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  let result = null;
  let whereConditions = ['1=1'];
  let replacements = {};
  let totalCount;

  const gubun = request.query?.gubun;
  const startDate = request.query?.startDate ? request.query.startDate : null;
  const endDate = request.query?.endDate ? request.query.endDate : null;
  const consultantId = request.query?.counselor ? request.query?.counselor : null;
  const rpp = request.query?.rpp;
  const page = request.query?.page;

  const limitSentens = 'LIMIT :limit OFFSET :offset';

  try {
    if (rpp && page) {
      replacements.limit = parseInt(rpp, 10);
      replacements.offset = (page - 1) * rpp;
    }

    if (gubun.trim() === 'consultation') {
      if (startDate && endDate) {
        replacements.startDate = startDate;
        replacements.endDate = endDate;
        whereConditions.push(' (DATE(con.createdAt) >= DATE(:startDate) and DATE(con.createdAt) <= DATE(:endDate)) ');
      } else {
        if (startDate) {
          replacements.startDate = startDate;
          whereConditions.push(' (DATE(con.createdAt) >= DATE(:startDate)) ');
        } else if (endDate) {
          replacements.endDate = endDate;
          whereConditions.push(' (DATE(con.createdAt) <= DATE(:endDate)) ');
        }
      }
      if (consultantId) {
        const chgConsultantId = `%${consultantId}%`;
        replacements.consultantId = chgConsultantId;
        whereConditions.push(' usersOrg.name LIKE :consultantId ');
      }

      result = await models.sequelize.query(
        `SELECT 
        DATE(con.createdAt) as date,
        COALESCE(SUM(CASE WHEN con.csClass LIKE '%%' THEN 1 ELSE 0 END), 0 ) as allCount,
        COALESCE(SUM(CASE WHEN con.csClass = 'CHG' THEN 1 ELSE 0 END), 0 ) as chg,
        COALESCE(SUM(CASE WHEN con.csClass = 'BRK' THEN 1 ELSE 0 END), 0 ) as brk,
        COALESCE(SUM(CASE WHEN con.csClass = 'PAY' THEN 1 ELSE 0 END), 0 ) as pay,
        COALESCE(SUM(CASE WHEN con.csClass = 'REG' THEN 1 ELSE 0 END), 0 ) as reg,
        COALESCE(SUM(CASE WHEN con.csClass = 'CAR' THEN 1 ELSE 0 END), 0 ) as car,
        COALESCE(SUM(CASE WHEN con.csClass = 'ETC' THEN 1 ELSE 0 END), 0 ) as etc
        FROM Consultations AS con
        LEFT OUTER JOIN UsersNews as conUser ON (con.consultantId = conUser.id) 
        LEFT OUTER JOIN Orgs AS usersOrg ON (conUser.orgId = usersOrg.id)
        WHERE
        ${whereConditions.join(' AND ')}
        GROUP BY DATE(createdAt)
        ORDER BY DATE(createdAt) DESC
        ${limitSentens}
            `,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: replacements,
          nest: true,
        }
      );

      totalCount = await models.sequelize.query(
        `SELECT COUNT (*) AS totalCount 
        FROM (
        SELECT 
        DATE(con.createdAt) as date,
        COALESCE(SUM(CASE WHEN con.csClass LIKE '%%' THEN 1 ELSE 0 END), 0 ) as ALLCount,
        COALESCE(SUM(CASE WHEN con.csClass = 'CHG' THEN 1 ELSE 0 END), 0 ) as CHG,
        COALESCE(SUM(CASE WHEN con.csClass = 'BRK' THEN 1 ELSE 0 END), 0 ) as BRK,
        COALESCE(SUM(CASE WHEN con.csClass = 'PAY' THEN 1 ELSE 0 END), 0 ) as PAY,
        COALESCE(SUM(CASE WHEN con.csClass = 'REF' THEN 1 ELSE 0 END), 0 ) as REF,
        COALESCE(SUM(CASE WHEN con.csClass = 'CMC' THEN 1 ELSE 0 END), 0 ) as CMC,
        COALESCE(SUM(CASE WHEN con.csClass = 'ETC' THEN 1 ELSE 0 END), 0 ) as ETC
        FROM Consultations AS con
        LEFT OUTER JOIN UsersNews as conUser ON (con.consultantId = conUser.id) 
        LEFT OUTER JOIN Orgs AS usersOrg ON (conUser.orgId = usersOrg.id)
        WHERE
        ${whereConditions.join(' AND ')}
        GROUP BY DATE(con.createdAt)
            ) subQuery`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: replacements,
          nest: true,
        }
      );
    } else if (gubun.trim() === 'refund') {
      if (startDate && endDate) {
        replacements.startDate = startDate;
        replacements.endDate = endDate;
        whereConditions.push('(DATE(ref.createdAt) >= DATE(:startDate) and DATE(ref.createdAt) <= DATE(:endDate))');
      } else {
        if (startDate) {
          replacements.startDate = startDate;
          whereConditions.push('(DATE(ref.createdAt) >= DATE(:startDate))');
        } else if (endDate) {
          replacements.endDate = endDate;
          whereConditions.push('(DATE(ref.createdAt) <= DATE(:endDate))');
        }
      }
      if (consultantId) {
        const chgConsultantId = `%${consultantId}%`;
        replacements.consultantId = chgConsultantId;
        whereConditions.push(' usersOrg.name LIKE :consultantId ');
      }
      result = await models.sequelize.query(
        `SELECT
        DATE(ref.createdAt) AS date,
        SUM(ref.cancelAmount) AS totalCancelAmount,
        COUNT(ref.id) AS refundCount
        FROM RequestRefunds ref
        LEFT OUTER JOIN Orgs AS usersOrg ON (ref.orgId = usersOrg.id)
        WHERE
        ${whereConditions.join(' AND ')}
        GROUP BY DATE(ref.createdAt)
        ORDER BY DATE(ref.createdAt) DESC
        ${limitSentens}
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: replacements,
          nest: true,
        }
      );

      totalCount = await models.sequelize.query(
        `SELECT COUNT(*) as totalCount FROM (
          SELECT
        DATE(ref.createdAt) AS date,
        SUM(ref.cancelAmount) AS totalCancelAmount,
        COUNT(ref.id) AS refundCount
        FROM RequestRefunds ref
        LEFT OUTER JOIN Orgs AS usersOrg ON (ref.orgId = usersOrg.id)
        WHERE
        ${whereConditions.join(' AND ')}
        GROUP BY DATE(ref.createdAt)
        ) subQuery
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: replacements,
          nest: true,
        }
      );
      console.log(totalCount[0].totalCount);
    } else if (gubun.trim() === 'callLogList') {
      if (startDate && endDate) {
        replacements.startDate = startDate;
        replacements.endDate = endDate;
        whereConditions.push('(DATE(createdAt) >= DATE(:startDate) and DATE(createdAt) <= DATE(:endDate))');
      } else {
        if (startDate) {
          replacements.startDate = startDate;
          whereConditions.push('(DATE(createdAt) >= DATE(:startDate))');
        } else if (endDate) {
          replacements.endDate = endDate;
          whereConditions.push('(DATE(createdAt) <= DATE(:endDate))');
        }
      }
      result = await models.sequelize.query(
        `SELECT 
            DATE(createdAt) AS date,
            COALESCE(SUM(CASE WHEN csEvent = 'Ringing' THEN 1 ELSE 0 END), 0) AS ringingCount,
            COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) AS hangupCount,
            COALESCE(SUM(CASE WHEN csEvent = 'Ringing' THEN 1 ELSE 0 END), 0) - 
            COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) AS giveupCount,
            CASE 
            WHEN COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) = 0 THEN 0
            ELSE CAST(
                (COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) * 100 / COALESCE(SUM(CASE WHEN csEvent = 'Ringing' THEN 1 ELSE 0 END), 0))
                AS SIGNED
            )
        END AS rate
            FROM CsCallLogs 
            WHERE 
            ${whereConditions.join(' AND ')}
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) DESC
            ${limitSentens}
              `,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: replacements,
          nest: true,
        }
      );

      totalCount = await models.sequelize.query(
        `SELECT COUNT(*) AS totalCount FROM (
          SELECT 
            DATE(createdAt) AS date,
            COALESCE(SUM(CASE WHEN csEvent = 'Ringing' THEN 1 ELSE 0 END), 0) AS ringingCount,
            COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) AS hangupCount,
            COALESCE(SUM(CASE WHEN csEvent = 'Ringing' THEN 1 ELSE 0 END), 0) - 
            COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) AS giveupCount,
            CASE 
            WHEN COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) = 0 THEN 0
            ELSE (COALESCE(SUM(CASE WHEN csEvent = 'Hangup' THEN 1 ELSE 0 END), 0) / COALESCE(SUM(CASE WHEN csEvent = 'Ringing' THEN 1 ELSE 0 END), 0)) * 100
            END AS rate
            FROM CsCallLogs 
            WHERE 
            ${whereConditions.join(' AND ')}
            GROUP BY DATE(createdAt)
        ) subQuery`,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: replacements,
          nest: true,
        }
      );
    }
    return response.status(HTTP_STATUS_CODE.OK).json({ totalCount: totalCount[0].totalCount, result: result });
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

module.exports = { getCallList };
