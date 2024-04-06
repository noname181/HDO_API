import { NextFunction, Request, Response } from 'express';
const models = require('../../../../models');
const { USER_ROLE } = require('../../../../middleware/role.middleware');
const { USER_STATUS } = require('../loginByAccountId/loginByAccountId');

module.exports = {
  path: '/mobile/auth/account/check',
  method: 'post',
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request: Request, response: Response, next: NextFunction) {
  const { accountId } = request.body;
  const { count: existsUser } = await models.UsersNew.findAndCountAll({
      where: {
          type: 'MOBILE',
          accountId: accountId,
          status: {
              [models.Sequelize.Op.in]: ['ACTIVE', 'BLOCK']
          },
      }, 
  });
  if (existsUser) {
      return next('ACCOUNT_ID_IS_EXISTS');
  }
  return response.status(200).json({
      success: 'AccountId can be registered now',
  });
}

function validator(request: Request, response: Response, next: NextFunction) {
  const { body } = request;

  if (!body || !body.accountId) {
    throw 'ACCOUNT_ID_IS_EMPTY';
  }

  const accountId: string = body.accountId.toString().trim();
  if (accountId.length < 6 || accountId.length > 12) {
    throw 'INVALID_ACCOUNT_ID_LENGTH';
  }

  const validAccountIdRegex = /^[a-zA-z0-9]+$/g;
  if (!validAccountIdRegex.test(accountId)) {
    throw 'INVALID_ACCOUNT_ID';
  }

  request.body.accountId = accountId;
  next();
}

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  if (error === 'ACCOUNT_ID_IS_EMPTY') {
    return response.error.badRequest(error, '아이디가 입력해주세요.');
  }

  if (error === 'INVALID_ACCOUNT_ID_LENGTH') {
    return response.error.badRequest(error, '6~12자 사이로 입력해주세요.');
  }

  if (error === 'INVALID_ACCOUNT_ID') {
    return response.error.badRequest(error, '영문숫자 조합으로 입력해주세요');
  }

  if (error === 'ACCOUNT_ID_IS_EXISTS') {
    return response.error.badRequest(error, '이미 사용중인 아이디입니다.');
  }

  next();
}
