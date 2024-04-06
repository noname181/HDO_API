const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const Sequelize = require('sequelize');
const { phoneNoMask } = require('../user/transformAdminUser/transformAdminUser');


const getConsultation = {
  path: '/web/consultation',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  status: 'PRIVATE',
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const id = request.query.id;
  const userId = request.user.id || request.user.sub;
  let user = await models.UsersNew.findOne({
    where: { id: userId },
    include: [
      {
        model: models.Org,
        as: 'Org',
      },
    ],
  });

  try {
    const consultation = await models.sequelize.query(
      `SELECT 
      Consultation.*,
      Customer.id AS Customer_id, 
      Customer.accountId AS Customer_accountId, 
      Customer.name AS Customer_name, 
      Customer.phoneNo AS Customer_phoneNo, 
      Customer.email AS Customer_email,
      Customer.gender AS Customer_gender,
      Customer.birth AS Customer_birth,
      Consultant.id AS Consultant_id, 
      Consultant.accountId AS Consultant_accountId, 
      Consultant.name AS Consultant_name, 
      Consultant.phoneNo AS Consultant_phoneNo,
      Consultant.email AS Consultant_email, 
      Consultant.orgId AS Consultant_orgId, 
      UpdateCon.id AS UpdateCon_id,
      UpdateCon.name AS UpdateCon_name,
      UpdateCon.email AS UpdateCon_email,
      UpdateCon.orgId AS UpdateCon_orgId,
      OrgConsultant.fullname AS Consultant_orgFullName, 
      OrgConsultant.category AS Consultant_category,
      Org.id AS Org_id, 
      Org.category AS Org_category, 
      Org.name AS Org_name,
      CsTransfer.id AS CsTransfer_id, 
      CsTransfer.transPart, 
      CsTransfer.transWhom, 
      CsTransfer.transAt,
      CsMessage.id AS CsMessage_id, 
      CsMessage.phoneNo AS CsMessage_phoneNo, 
      CsMessage.text_message, 
      CsMessage.createdAt AS CsMessage_createdAt,
      ChargingStation.chgs_id AS ChargingStationId,
      ChargingStation.chgs_name AS ChargingStationName
  FROM 
      Consultations AS Consultation
  LEFT JOIN 
      UsersNews AS Customer ON Consultation.CustomerId = Customer.id
  LEFT JOIN 
      UsersNews AS Consultant ON Consultation.ConsultantId = Consultant.id
  LEFT JOIN 
      UsersNews AS UpdateCon ON Consultation.updatedWho = UpdateCon.id
  LEFT JOIN 
      Orgs AS Org ON Consultation.OrgId = Org.id
  LEFT OUTER JOIN 
      Orgs AS OrgConsultant ON Consultant.OrgId = OrgConsultant.id    
  LEFT JOIN 
      CsTransfers AS CsTransfer ON Consultation.transId = CsTransfer.id
  LEFT JOIN 
      CsMessages AS CsMessage ON Consultation.messageId = CsMessage.id
  LEFT JOIN 
      sb_charging_stations AS ChargingStation ON Consultation.chgs_id = ChargingStation.chgs_id
      where Consultation.id = :ConsultationId
      `,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { ConsultationId: id },
        nest: true,
      }
    );
    const result = consultation.map((value) => {
      return {
        ...value,
        phoneNo: user?.Org?.category == "AS" ? phoneNoMask(value?.phoneNo ?? '') : value?.phoneNo,
      };
    });
    return response.status(HTTP_STATUS_CODE.OK).json(result);
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

module.exports = { getConsultation };
