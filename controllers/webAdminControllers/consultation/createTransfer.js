const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const sequelize = require('sequelize');
const { Sequelize } = require('sequelize');

const createTransfer = {
  path: '/web/cs-transfer/:csId',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { params, body } = request;
  const csId = params.csId;
  const { transPart, statusCd } = body;

  try {
    let transPartValue = transPart;
    if (statusCd) {
      if (statusCd.trim() === 'ARR') {
        transPartValue = '2';
      }
    }

    const userInfo = await models.sequelize.query(
      `SELECT org.category AS orgCategory, org.id AS orgId, users.id AS userId 
        FROM UsersNews AS users
        LEFT JOIN Orgs AS org ON org.id = users.orgId
        WHERE org.id = :orgId`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { orgId: transPartValue },
        nest: true,
      }
    );

    const createTransferInput = {
      transPart: transPartValue,
      transWhom: userInfo[0].userId,
      csId,
      transAt: new Date(),
    };

    const transfer = await models.CsTransfer.create(createTransferInput);

    await models.Consultation.update(
      { transId: transfer.id },
      {
        where: {
          id: csId,
        },
      }
    );
    await models.sequelize.query(
      `INSERT INTO CsLogs
    (csId, regNo, messageId, consultantId, customerId, ktApiId1, ktApiId2, callStartTime, callEndTime
    , csCls1, csCls2, csContent, prsContent, statusCd, completeDate, approveWho, approveAt
    , createdAt, updatedAt, createdWho, updatedWho, incomingCd, csClass, phoneNo, transId, recordFile)
    SELECT
    id, regNo, messageId, consultantId, customerId, ktApiId1, ktApiId2, callStartTime, callEndTime
    , csCls1, csCls2, csContent, prsContent, statusCd, completeDate, approveWho, approveAt
    , createdAt, updatedAt, createdWho, updatedWho, incomingCd, csClass, phoneNo, transId, recordFile
    FROM Consultations
    WHERE id = :ConsultationId
    `,
      {
        type: Sequelize.QueryTypes.INSERT,
        replacements: { ConsultationId: csId },
      }
    );

    response.status(HTTP_STATUS_CODE.CREATE).json(transfer);
  } catch (error) {
    console.error('createTransfer::service::', error);
    next(error);
  }
}

function validator(request, response, next) {
  const { body } = request;

  if (!body) {
    throw 'NO_REQUIRED_INPUT';
  }
  next();
}

function errorHandler(error, request, response, next) {
  console.log('error::', error);
  if (error === 'NO_REQUIRED_INPUT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '필수 입력 정보가 누락되었습니다.',
    });
  }
  next();
}

module.exports = { createTransfer };
