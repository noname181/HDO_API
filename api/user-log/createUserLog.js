const { getClientIp } = require('request-ip');
const { USER_LOG_STATUS } = require('../../interfaces/userLogStatus.interface');
const { HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/users/logs'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: true,
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { body, user, originalUrl, method, headers } = request;

  if (!body.type) {
    return next('NO_REQUIRED_INPUT');
  }

  const ipAddress = getClientIp(request) || '';
  const requestInfo = `, ip: ${ipAddress}, url: ${originalUrl},  method: ${method}, user-agent: ${headers['user-agent']}`;
  let type = '';
  let logInfoString = '';
  if(body.type === 'EXCEL_DOWNLOAD'){
    type = USER_LOG_STATUS.EXCEL_DOWNLOAD;
    logInfoString = `Excel download, email: ${user.id}, sub: ${user.id}, userId: ${user.id}${requestInfo}`;
  }else{
    type = USER_LOG_STATUS.LOGOUT;
    logInfoString = `Logout, email: ${user.id}, sub: ${user.id}, userId: ${user.id}${requestInfo}`;
  }
  
  await models.UserLogs.create({
    status: type,
    ipAddress,
    note: logInfoString,
    userId: user.id,
    urlPage: originalUrl
  });

  return response.status(HTTP_STATUS_CODE.CREATE).json({ status: 'success' });
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
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
