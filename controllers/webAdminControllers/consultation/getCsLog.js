const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const Sequelize = require('sequelize');

const getCsLog = {
  path: '/web/cs-log',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const id = request.query.id;
  try {
    const csLogs = await models.sequelize.query(
      `SELECT regNo
      , statusNm
      , prsContent
      , hisCreatedAt
      , transOrgNm AS dept
      , consultantName AS chage_person
      , createdAt
      , completeDate
      , updatedAt
      , updateName
      , upOrgName
      FROM (
        SELECT CsLog.id
		          , regNo
		          , statusCd
              , IF(statusCd = 'HOL','보류'
              , IF(statusCd = 'COM','완료'
              , IF(statusCd = 'APR','승인'
              , IF(statusCd = 'REF','환불'
              , IF(statusCd = 'ARR','승인요청'
              , IF(statusCd = 'RER','환불요청'
              , IF(statusCd = 'RET','반려'
              , IF(statusCd = 'RCT','회수'
              , IF(statusCd = 'TRA','이관',''))))))))) AS statusNm
              , prsContent
		  , hisCreatedAt 
        , consultantId 
		  , consultantOrgId
		  , consultantName
        , CASE 
      	WHEN ConsultantOrg.name LIKE '%상담센터%' THEN 'CS'
   	   ELSE ConsultantOrg.name
	      END AS 'consultantOrgNm'
        , ConsultantOrg.category AS consultantOrgCa
        , CASE 
      	WHEN transOrg.name LIKE '%상담센터%' THEN 'CS'
   	   ELSE transOrg.name
	      END AS 'transOrgNm'
        , transOrg.category AS transWhomOrgCa
        , CsLog.createdAt
        , CsLog.updatedAt
		    , CsLog.completeDate 
		    , CsLog.transPart
        , CsLog.updatedWho
        , CsLog.updateName
        , CASE 
      	WHEN upOrgName LIKE '%상담센터%' THEN 'CS'
   	   ELSE upOrgName
	      END AS 'upOrgName'
        FROM (
   		SELECT 
			 CsLog.id
			 , CsLog.regNo
			 , CsLog.statusCd
			 , CsLog.prsContent
			 , CsLog.hisCreatedAt
       , CsLog.createdAt
			 , CsLog.updatedAt
			 , CsLog.completeDate 
       , CsLog.consultantId 
       , CsLog.updatedWho
			 , CsUser.orgId AS consultantOrgId
			 , CsUser.name AS consultantName
       , CsTransfer.transWhom
       , CsTransfer.transPart
       , UpdateUser.orgId 
       , UpdateUser.name AS updateName
       , UpdateOrg.id AS uoId
       , UpdateOrg.name AS upOrgName
        FROM CsLogs AS CsLog
        LEFT OUTER JOIN CsTransfers AS CsTransfer ON CsLog.transId = CsTransfer.id
        LEFT OUTER JOIN UsersNews AS CsUser ON CsLog.consultantId = CsUser.id
        LEFT OUTER JOIN UsersNews AS UpdateUser ON CsLog.updatedWho = UpdateUser.id
        LEFT OUTER JOIN Orgs AS UpdateOrg ON UpdateUser.orgId = UpdateOrg.id
        WHERE CsLog.csId = :csId
        AND (
			 (
			 	(CsLog.statusCd = 'TRA' AND CsTransfer.transWhom IS NOT NULL) 
				 OR (CsLog.statusCd = 'ARR' AND CsTransfer.transWhom IS NOT NULL)) 
				 OR CsLog.statusCd <> 'TRA')
			 ) CsLog
        LEFT OUTER JOIN Orgs AS ConsultantOrg ON CsLog.consultantOrgId = ConsultantOrg.id
        LEFT OUTER JOIN Orgs AS transOrg ON CsLog.transPart = transOrg.id
      ) CsLog
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { csId: id },
        nest: true,
      }
    );
    return response.status(HTTP_STATUS_CODE.OK).json(csLogs);
  } catch (error) {
    console.error('Error fetching csLogs:', error);
    response.status(500).json({ message: 'Internal server error' });
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getCsLog };
