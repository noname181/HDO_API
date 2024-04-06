/**
 * 해당 유저가 API 호출 시 마다 StackDriver에 로그를 남기기 위한 Logger
 */

import { NextFunction, Request, Response } from 'express';
import { getClientIp } from 'request-ip';
import { USER_LOG_STATUS } from '../interfaces/userLogStatus.interface';
import { cloneDeep } from '../util/lodash';
const models = require('../models');

export const userActionLogMiddleware = (logDisable = false, status = 'INFO') => {
  return async (_request: Request, _response: Response, next: NextFunction) => {
    if (logDisable) {
      next();
      return;
    }

    try {
      // firebase에선 uid, aws에선 sub or username
      const ipAddress = getClientIp(_request) || '';
      const { user, originalUrl, method, headers, useragent } = _request;
      const agent = useragent?.source || 'unknown';

      const requestInfo = `, ip: ${ipAddress}, url: ${originalUrl},  method: ${method}, user-agent: ${agent}`;
      const maskSensitive = maskSensitiveKeys(_request.body);
      const maskSensitiveInfo = maskSensitive ? `, ${JSON.stringify(maskSensitive)}` : '';
      const logInfoString = user
        ? `user-action-log, email: ${user.id || 'unknown'}, sub: ${user.id || 'unknown'}, userId: ${
            user.id || 'unknown'
          }${requestInfo}${maskSensitiveInfo}`
        : `user-action-log, email: unknown, userId: unknown${requestInfo}${maskSensitiveInfo}`;

      console.log(`[${new Date().toISOString().replace('Z', '').replace('T', ' ')}] ` + logInfoString);

      const logMethod = ['DELETE', 'POST', 'PUT'];
      let logStatus = logMethod.find((item) => item === _request.method.toUpperCase()) || status;
      const getStatus = findLogStatus(logStatus);

      if (user) {
        await models.UserLogs.create({
          status: getStatus,
          ipAddress,
          note: logInfoString,
          userId: user.id,
          urlPage: headers['location'] || undefined,
        });
      }
      return next();
    } catch (e) {
      console.error(e);
      return next();
    }
  };
};

// body에 민감한 키값이 있을 경우 *로 마스킹 처리
function maskSensitiveKeys(request: Request) {
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

const findLogStatus = (status: string) => {
  const logStatus: Record<string, USER_LOG_STATUS> = {
    private: USER_LOG_STATUS.PRIVATE,
    info: USER_LOG_STATUS.INFO,
    delete: USER_LOG_STATUS.DELETE,
    post: USER_LOG_STATUS.CREATE,
    put: USER_LOG_STATUS.UPDATE,
  };

  return logStatus[status.toLowerCase()] || logStatus.info;
};
