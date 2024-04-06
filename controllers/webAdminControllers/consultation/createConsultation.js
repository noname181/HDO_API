const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const sequelize = require('sequelize');

const createConsultation = {
  path: '/web/cs-create',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { body } = request;
  const reqConsultantId = request.user.id;
  const {
    regNo,
    messageId,
    consultantId = reqConsultantId,
    customerId,
    ktApiId1,
    ktApiId2,
    callStartTime,
    callEndTime,
    csCls1,
    csCls2,
    csContent,
    prsContent,
    orgId,
    statusCd,
    createdWho = reqConsultantId,
    updatedWho = reqConsultantId,
    incomingCd,
    csClass,
    phoneNo,
    transId,
    completeDate,
    recordFile,
    chgs_id,
  } = body;

  try {
    const createConsultationInput = {
      regNo,
      messageId,
      consultantId,
      customerId,
      ktApiId1,
      ktApiId2,
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

    const hasConsultation = await models.Consultation.findOne({
      where: {
        regNo,
      },
    });

    if (hasConsultation) {
      return next('CONSULTATION_IS_EXISTS');
    }

    const consultation = await models.Consultation.create(createConsultationInput);

    await createCsLog(consultation.id);

    response.status(HTTP_STATUS_CODE.CREATE).json(consultation);
  } catch (innerError) {
    console.error('Database operation failed:', innerError);
    throw innerError;
  }
}
// 유효성 검사
function validator(request, response, next) {
  const { body } = request;

  if (!body) {
    throw 'NO_REQUIRED_INPUT';
  }
  next();
}

// 상담 내역 로그 저장
const createCsLog = async (constId) => {
  try {
    const logQuery = `INSERT INTO CsLogs
    (csId, regNo, messageId, consultantId, customerId, ktApiId1, ktApiId2, callStartTime, callEndTime
    , csCls1, csCls2, csContent, prsContent, statusCd, completeDate, approveWho, approveAt
    , createdAt, updatedAt, createdWho, updatedWho, incomingCd, csClass, phoneNo, transId, recordFile, chgs_id)
    SELECT
    id, regNo, messageId, consultantId, customerId, ktApiId1, ktApiId2, callStartTime, callEndTime
    , csCls1, csCls2, csContent, prsContent, statusCd, completeDate, approveWho, approveAt
    , createdAt, updatedAt, createdWho, updatedWho, incomingCd, csClass, phoneNo, transId, recordFile, chgs_id
    FROM Consultations
    WHERE id = :constparamId`;

    await models.sequelize.query(logQuery, {
      type: sequelize.QueryTypes.INSERT,
      replacements: { constparamId: constId },
    });
  } catch (error) {
    console.error('Error in createCsLog:', error);
    throw new Error('Failed to create CS Log');
  }
};

function errorHandler(error, request, response, next) {
  if (error === 'NO_REQUIRED_INPUT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '필수 입력 정보가 누락되었습니다.',
    });
  }

  if (error === 'CONSULTATION_IS_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '접수번호가 이미 존재합니다.',
    });
  }

  if (error === 'CREATE_USER_ERROR') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '저장되지 않았습니다.',
    });
  }

  next();
}

module.exports = { createConsultation };
