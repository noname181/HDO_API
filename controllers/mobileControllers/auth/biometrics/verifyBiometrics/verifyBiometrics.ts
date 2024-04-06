import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE } from '../../../../../middleware/newRole.middleware';
import { configuration } from '../../../../../config/config';
import { PasswordService } from '../../../../../util/passwordService';
const models = require('../../../../../models');

export const verifyBiometrics = {
  path: '/mobile/auth/biometrics/verify',
  method: 'post',
  checkToken: true,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request: Request, response: Response, next: NextFunction) {
  const { body, user: userAuth } = request;

  const { deviceId = '', password = '' } = body;
  if (!password) {
    return next('INVALID_INPUT');
  }

  if (!passwordValidator(password)) {
    return next('INVALID_PASSWORD');
  }

  const user = await models.UsersNew.findByPk(userAuth.id);

  if (!user) {
    return next('USER_IS_NOT_FOUND');
  }

  const config = configuration();
  const passwordService = new PasswordService(config);

  const isMatchPassword = await passwordService.compare(password, user.hashPassword);

  return response.status(HTTP_STATUS_CODE.OK).json({ result: isMatchPassword });
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
      message: '유효하지 않은 결제입니다.',
    });
  }

  if (error === 'INVALID_PASSWORD') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '비밀번호가 유효하지 않습니다',
    });
  }

  if (error === 'USER_IS_NOT_FOUND') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '회원이 없습니다.',
    });
  }
  next();
}

const passwordValidator = (password: string) => {
  const regex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z!@#$%^&*\d]{8,12}$/g;
  return password ? regex.test(password) : false;
};
