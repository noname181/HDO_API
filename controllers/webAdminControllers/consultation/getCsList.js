const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { TokenExpiredError, sign, verify } = require('jsonwebtoken');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const Sequelize = require('sequelize');

const getCsList = {
  path: '/web/cs-list',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

const formatRegNosForSQL = (list) => {
  return list.map((item) => `'${item.regNo}'`).join(', ');
};

async function service(request, response, next) {
  try {
    const consultantId = request.user.id;
    const queryParams = request.query;
    const {
      page = 1,
      rpp = 50,
      select = 'ALL',
      search = null,
      csCls1 = null,
      startDate = null,
      endDate = null,
      ctartDate = null,
      cndDate = null,
      statusCd = null,
      incomingCd = null,
      csClass = null,
      conResult = null,
    } = queryParams;

    const limitSentens = 'LIMIT :limit OFFSET :offset';

    const userInfo = await models.sequelize.query(
      `SELECT org.category, org.id FROM UsersNews AS users
        LEFT JOIN Orgs AS org ON org.id = users.orgId
        WHERE users.id = :consultantId`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { consultantId: consultantId },
        nest: true,
      }
    );

    const userCategory = userInfo[0]?.category;
    const userOrgId = userInfo[0]?.id;
    const stringUserOrgId = userOrgId.toString();

    let replacements = {
      userOrgId: userOrgId,
      search: search ? search.trim() : null, // search가 null일 수 있으므로 조건 처리
    };

    let whereConditions = ['1=1'];

    if (userCategory === 'AS') {
      const asList = await models.sequelize.query(
        `SELECT DISTINCT regNo FROM CsLogs AS csLog
          LEFT OUTER JOIN CsTransfers AS csTransfer ON csLog.transId = csTransfer.id
          WHERE csTransfer.transPart = :userOrgId
        `,
        {
          type: models.sequelize.QueryTypes.SELECT,
          replacements: { userOrgId: userOrgId },
        }
      );

      // regNos 배열을 생성하고 replacements 객체에 추가합니다.
      const regNos = asList.map((item) => item.regNo);
      replacements.regNos = regNos;
      whereConditions.push(`(CsTransfer.transPart = :userOrgId OR Consultation.regNo IN (:regNos))`);
    }

    if (search) {
      const searchWildcard = `%${replacements.search}%`;
      replacements.searchWildcard = searchWildcard;

      if (select.trim() === 'ID') {
        whereConditions.push(`Customer.accountId = :search`);
      } else if (select.trim() === 'PHONE') {
        whereConditions.push(`Consultation.phoneNo = :search`);
      } else if (select.trim() === 'CONTENT') {
        whereConditions.push(`Consultation.csContent LIKE :searchWildcard`);
      } else if (select.trim() === 'REGNO') {
        whereConditions.push(`Consultation.regNo LIKE :searchWildcard`);
      } else if (select.trim() === 'USERPHONE') {
        whereConditions.push(`Customer.phoneNo = :search`);
      } else {
        whereConditions.push(`(Customer.accountId = :search OR
                              Consultation.phoneNo = :search OR
                              Consultation.regNo LIKE :searchWildcard OR
                              Customer.phoneNo = :search OR
                              Consultation.csContent LIKE :searchWildcard)`);
      }
    }

    if (csCls1 && csCls1.trim().length > 0) {
      if (csCls1.trim() === 'DEF') {
        whereConditions.push(` Org.category IS NOT NULL`);
      } else {
        whereConditions.push(` Org.category IS NULL`);
      }
    }
    if (startDate && startDate.trim().length > 0 && endDate && endDate.trim().length > 0) {
      replacements.startDate = `${startDate.trim()} 00:00:00`;
      replacements.endDate = `${endDate.trim()} 23:59:59`;
      whereConditions.push(` Consultation.createdAt BETWEEN :startDate AND :endDate`);
    }

    if (ctartDate && ctartDate.trim().length > 0 && cndDate && cndDate.trim().length > 0) {
      replacements.ctartDate = `${ctartDate.trim()} 00:00:00`;
      replacements.cndDate = `${cndDate.trim()} 23:59:59`;
      whereConditions.push(`Consultation.completeDate BETWEEN :ctartDate AND :cndDate`);
    }

    if (statusCd && statusCd.trim().length > 0) {
      // 진행중 분기
      if (statusCd.trim() === 'ING') {
        if (userCategory === 'AS') {
          whereConditions.push(
            ` ((Consultation.statusCd = 'TRA' AND CsTransfer.transPart = :userOrgId) OR (Consultation.statusCd = 'HOL' AND CsTransfer.transPart = :userOrgId))`
          );
        } else {
          whereConditions.push(
            ` ((Consultation.statusCd = 'TRA' AND CsTransfer.transPart = :userOrgId) OR Consultation.statusCd = 'HOL')`
          );
        }
      } else if (statusCd.trim() === 'COM') {
        // 처리 완료 분기
        if (userCategory.trim() === 'CS') {
          whereConditions.push(
            ` ((Consultation.statusCd IN ('COM', 'ARR')) OR (Consultation.statusCd = 'TRA' AND CsTransfer.transPart != :userOrgId))`
          );
        } else if (userCategory.trim() === 'AS') {
          whereConditions.push(` Consultation.statusCd IN ('COM', 'ARR')`);
        } else if (userCategory.trim() === 'HDO') {
          whereConditions.push(
            ` (Consultation.statusCd = 'COM' OR (Consultation.statusCd = 'TRA' AND CsTransfer.transPart != :userOrgId))`
          );
        }
      } else if (statusCd.trim() === 'REC') {
        whereConditions.push(` Consultation.statusCd = 'TRA' AND CsTransfer.transPart = :userOrgId`);
      }
    }

    if (incomingCd && incomingCd.trim().length > 0) {
      replacements.incomingCd = incomingCd ? incomingCd.trim() : null;
      whereConditions.push(` Consultation.incomingCd = :incomingCd`);
    }
    if (csClass && csClass.trim().length > 0) {
      replacements.csClass = csClass ? csClass.trim() : null;
      whereConditions.push(` Consultation.csClass = :csClass`);
    }

    if (rpp && page) {
      replacements.limit = parseInt(rpp, 10);
      replacements.offset = (page - 1) * rpp;
      console.log('확인');
    }
    whereConditions.push(` (Customer.status = 'ACTIVE' OR Customer.status IS NULL OR Customer.status = 'SLEEP')`);

    const rows = await models.sequelize.query(
      `SELECT
      Consultation.*,
      Customer.id AS 'Customer.id',
      Customer.accountId AS 'Customer.accountId',
      Customer.name AS 'Customer.name',
      Customer.phoneNo AS 'Customer.phoneNo',
      Customer.email AS 'Customer.email',
      Consultant.id AS 'Consultant.id',
      Consultant.accountId AS 'Consultant.accountId',
      Consultant.name AS 'Consultant.name',
      Consultant.phoneNo AS 'Consultant.phoneNo',
      Consultant.email AS 'Consultant.email',
      Consultant.orgId AS 'Consultant.OrgId',
      ConsultantOrg.category AS 'Consultant.category',
      ConsultantOrg.fullname AS 'Consultant.fullname',
      UpdateCon.id AS UpdateCon_id,
      UpdateCon.name AS UpdateCon_name,
      UpdateCon.email AS UpdateCon_email,
      UpdateCon.orgId AS UpdateCon_orgId,
      UpdateConOrgs.name AS UpdateCon_orgName,
      UpdateConOrgs.fullname AS updateCon_orgFullName,
      CASE 
      WHEN UpdateConOrgs.name LIKE '%상담센터%' THEN 'CS'
      ELSE UpdateConOrgs.name
      END AS 'UpdateCon_orgTransName',
      CASE 
      WHEN ConsultantOrg.name LIKE '%상담센터%' THEN 'CS'
      ELSE ConsultantOrg.name
      END AS 'Consultant.OrgName',
      Org.id AS 'Org.id',
      Org.category AS 'Org.category',
      Org.name AS 'Org.name',
      CsTransfer.id AS 'CsTransfer.id',
      CsTransfer.transPart AS 'CsTransfer.transPart',
      CsTransfer.transWhom AS 'CsTransfer.transWhom',
      CASE 
      WHEN TransUserOrgs.name LIKE '%상담센터%' THEN 'CS'
      ELSE TransUserOrgs.name
      END AS 'CsTransfer.OrgName',
      TransUserOrgs.category AS 'CsTransfer.OrgCategory',
      CsTransUser.accountId AS 'CsTransfer.transWhomName',
      CsTransfer.transAt AS 'CsTransfer.transAt',
      CsMessage.id AS 'CsMessage.id',
      CsMessage.phoneNo AS 'CsMessage.phoneNo',
      CsMessage.text_message AS 'CsMessage.text_message',
      CsMessage.createdAt AS 'CsMessage.createdAt',
      SubCsLog.transId AS 'logTrans.transId',
      SubCsLog.transPart AS 'logTrans.transPart',
      SubCsLog.fullname AS 'logTrans.fullname'
   FROM Consultations AS Consultation
      LEFT OUTER JOIN UsersNews AS Customer ON Consultation.customerId = Customer.id
      AND (Customer.deletedAt IS NULL)
      LEFT OUTER JOIN UsersNews AS Consultant ON Consultation.consultantId = Consultant.id
      AND (Consultant.deletedAt IS NULL)
      LEFT OUTER JOIN Orgs AS ConsultantOrg ON Consultant.OrgId = ConsultantOrg.id
      LEFT OUTER JOIN Orgs AS Org ON Consultation.orgId = Org.id
      AND (Org.deletedAt IS NULL)
      LEFT OUTER JOIN CsTransfers AS CsTransfer ON Consultation.transId = CsTransfer.id
      LEFT OUTER JOIN Orgs AS TransUserOrgs ON CsTransfer.transPart = TransUserOrgs.id
      LEFT OUTER JOIN UsersNews AS CsTransUser ON CsTransfer.transWhom = CsTransUser.id
      LEFT OUTER JOIN UsersNews AS UpdateCon ON Consultation.updatedWho = UpdateCon.id
      LEFT OUTER JOIN Orgs AS UpdateConOrgs ON UpdateCon.orgId = UpdateConOrgs.id
      LEFT OUTER JOIN CsMessages AS CsMessage ON Consultation.messageId = CsMessage.id
      LEFT OUTER JOIN (
                        SELECT CsLogs.regNo AS regNo, CsLogs.transId AS transId, CsTransfer.transPart AS transPart, Org.fullname AS fullname
                                FROM CsLogs
                                JOIN (
                                SELECT regNo, MAX(id) AS max_seq
                                FROM CsLogs
                                GROUP BY regNo
                                ) AS SubQuery
                        ON CsLogs.regNo = SubQuery.regNo AND CsLogs.id = SubQuery.max_seq
                        LEFT OUTER JOIN CsTransfers AS CsTransfer ON CsTransfer.id = CsLogs.transId
                        LEFT OUTER JOIN Orgs AS Org ON Org.id = CsTransfer.transPart
                ) AS SubCsLog ON Consultation.regNo = SubCsLog.regNo
    WHERE
    ${whereConditions.join(' AND ')}
    ORDER BY
      Consultation.updatedAt DESC
      ${limitSentens}
            `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: replacements,
        nest: true,
      }
    );

    const count = await models.sequelize.query(
      `SELECT
      count(Consultation.id) AS count
      FROM Consultations AS Consultation
      LEFT OUTER JOIN UsersNews AS Customer ON Consultation.customerId = Customer.id
      AND (Customer.deletedAt IS NULL)
      LEFT OUTER JOIN UsersNews AS Consultant ON Consultation.consultantId = Consultant.id
      AND (Consultant.deletedAt IS NULL)
      LEFT OUTER JOIN Orgs AS Org ON Consultation.orgId = Org.id
      AND (Org.deletedAt IS NULL)
      LEFT OUTER JOIN CsTransfers AS CsTransfer ON Consultation.transId = CsTransfer.id
      LEFT OUTER JOIN Orgs AS TransUserOrgs ON CsTransfer.transPart = TransUserOrgs.id
      LEFT OUTER JOIN UsersNews AS CsTransUser ON CsTransfer.transWhom = CsTransUser.id
      LEFT OUTER JOIN CsMessages AS CsMessage ON Consultation.messageId = CsMessage.id
      LEFT OUTER JOIN (
			SELECT CsLogs.regNo AS regNo, CsLogs.transId AS transId, CsTransfer.transPart AS transPart, Org.fullname AS fullname
				FROM CsLogs
				JOIN (
    				SELECT regNo, MAX(id) AS max_seq
    				FROM CsLogs
    				GROUP BY regNo
				) AS SubQuery
			ON CsLogs.regNo = SubQuery.regNo AND CsLogs.id = SubQuery.max_seq
			LEFT OUTER JOIN CsTransfers AS CsTransfer ON CsTransfer.id = CsLogs.transId
			LEFT OUTER JOIN Orgs AS Org ON Org.id = CsTransfer.transPart
		) AS SubCsLog ON Consultation.regNo = SubCsLog.regNo
    WHERE
     ${whereConditions.join(' AND ')}
    ORDER BY
      Consultation.createdAt DESC
            `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: replacements,
        nest: true,
      }
    );

    return response.status(HTTP_STATUS_CODE.OK).json({ totalCount: count[0].count, result: rows });
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

module.exports = { getCsList };
