import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE } from '../../../../../middleware/newRole.middleware';
import { md5Hash } from '../../../../../util/md5Hash';

export const createToken = {
  path: '/mobile/auth/biometrics/token',
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

function service(request: Request, response: Response, next: NextFunction) {
  const { body } = request;

  const { deviceId = '' } = body;
  if (!deviceId) {
    return next('INVALID_INPUT');
  }

  const token = md5Hash(deviceId);

  return response.status(HTTP_STATUS_CODE.OK).json({ token });
}

function validator(request: Request, response: Response, next: NextFunction) {
  next();
}

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  if (error === 'INVALID_INPUT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유효하지 않은 값입니다.',
    });
  }
  next();
}
