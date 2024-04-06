'use strict';

const { getClientIp } = require('request-ip');
const models = require('../models');
const { USER_LOG_STATUS } = require("../interfaces/userLogStatus.interface");
const { cloneDeep } = require('lodash');

const generateLogNote = (request) => {
  const ipAddress = getClientIp(request) || '';
  const { user, originalUrl, method, useragent } = request;
  const agent = useragent?.source || 'unknown';
  const requestInfo = `, ip: ${ipAddress}, url: ${originalUrl},  method: ${method}, user-agent: ${agent}`;
  const maskSensitive = maskSensitiveKeys(request);
  const maskSensitiveInfo = maskSensitive ? `, ${JSON.stringify(maskSensitive)}` : '';

  const logInfoString = user
    ? `user-action-log, email: ${user.id || 'unknown'}, sub: ${user.id || 'unknown'}, userId: ${
        user.id || 'unknown'
      }${requestInfo}${maskSensitiveInfo}`
    : `user-action-log, email: unknown, userId: unknown${requestInfo}${maskSensitiveInfo}`;

  return { logInfoString, ipAddress, originalUrl };
};

const createUserLogs = async ({ request, details }) => {
  const { logInfoString, ipAddress, originalUrl } = generateLogNote(request);
  const logMethod = ['GET', 'DELETE', 'POST', 'PUT'];
  let logStatus = logMethod.find((item) => item === request.method.toUpperCase());
  const status = findLogStatus(logStatus);

  return await models.UserLogs.create({
    status,
    ipAddress,
    note: logInfoString,
    urlPage: originalUrl,
    userId: request.user.id || null,
    details: JSON.stringify(details),
  });
};

// body에 민감한 키값이 있을 경우 *로 마스킹 처리
function maskSensitiveKeys(request) {
  const { body } = request;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return '';
  }

  const requestBody = cloneDeep(body);
  const keys = Object.keys(requestBody);

  for (const key of keys) {
    if (
      typeof body[key] === 'string' &&
      (key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('phonenumber') ||
        key.toLowerCase().includes('phoneno'))
    ) {
      requestBody[key] = '********';
    }
  }

  return requestBody;
}

const findLogStatus = (status) => {
  const logStatus = {
    private: USER_LOG_STATUS.PRIVATE,
    info: USER_LOG_STATUS.INFO,
    delete: USER_LOG_STATUS.DELETE,
    post: USER_LOG_STATUS.CREATE,
    put: USER_LOG_STATUS.UPDATE,
    get: USER_LOG_STATUS.INQUIRY,
  };

  return logStatus[status.toLowerCase()] || logStatus.info;
};

module.exports = {
  createUserLogs,
};
