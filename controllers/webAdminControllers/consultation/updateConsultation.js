const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const { Sequelize } = require('sequelize');

const updateConsultation = {
  path: '/web/cs/:id',
  method: 'put',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { params, body } = request;
  const id = params.id;
  const userId = request.user.id;
  console.log(body);
  const {
    messageId,
    consultantId,
    customerId,
    ktApiId1,
    callStartTime,
    callEndTime,
    csCls1,
    csCls2,
    csContent,
    prsContent,
    orgId,
    statusCd,
    createdWho,
    updatedWho = userId,
    incomingCd,
    csClass,
    phoneNo,
    transId,
    transPart,
    completeDate,
    recordFile,
    chgs_id,
  } = body;

  let transIdTrans = transId;
  if (statusCd.toString() === 'ARR') {
    transIdTrans = '2';
  } else if (statusCd.toString() !== 'TRA') {
    transIdTrans = null;
  } else if (statusCd.toString() === 'RCT') {
  }

  try {
    const updateConsultationInput = {
      messageId,
      consultantId,
      customerId,
      ktApiId1,
      callStartTime,
      callEndTime,
      csCls1,
      csCls2,
      csContent,
      prsContent,
      orgId,
      statusCd,
      createdWho,
      updatedWho,
      incomingCd,
      csClass,
      phoneNo,
      transId,
      completeDate,
      recordFile,
      chgs_id,
    };
    updateConsultationInput.transId = transIdTrans;
    for (const key in updateConsultationInput) {
      if (updateConsultationInput[key] === undefined) {
        delete updateConsultationInput[key];
      }
    }

    const consultation = await models.Consultation.update(updateConsultationInput, {
      where: {
        id,
      },
    });

    const logQuery = `INSERT INTO CsLogs
    (csId, regNo, messageId, consultantId, customerId, ktApiId1, ktApiId2, callStartTime, callEndTime
    , csCls1, csCls2, csContent, prsContent, statusCd, completeDate, approveWho, approveAt
    , createdAt, updatedAt, createdWho, updatedWho, incomingCd, csClass, phoneNo, transId, recordFile, chgs_id)
    SELECT
    id, regNo, messageId, consultantId, customerId, ktApiId1, ktApiId2, callStartTime, callEndTime
    , csCls1, csCls2, csContent, prsContent, statusCd, completeDate, approveWho, approveAt
    , createdAt, updatedAt, createdWho, updatedWho, incomingCd, csClass, phoneNo, transId, recordFile, chgs_id
    FROM Consultations
    WHERE id = :id`;
    if (!transPart) {
      await models.sequelize.query(logQuery, {
        type: Sequelize.QueryTypes.INSERT,
        replacements: { id: id },
      });
    }

    // 수정된 데이터 겟수를 반환 ex) { 1 }
    response.status(HTTP_STATUS_CODE.OK).json(consultation);
  } catch (error) {
    console.error('updateConsultation::service::', error);
    next(error);
  }
}

function validator(request, response, next) {
  const { body } = request;
  if (!body || !body.updatedWho) {
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

module.exports = { updateConsultation };
