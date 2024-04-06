import { NextFunction, Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import { USER_TYPE } from '../../../../../util/tokenService';
import { HTTP_STATUS_CODE } from '../../../../../middleware/newRole.middleware';
import { createHash } from 'crypto';
import { configuration } from '../../../../../config/config';
import { LoggerService } from '../../../../../services/loggerService/loggerService';
import { EmailService } from '../../../../../services/emailService/emailService';
const models = require('../../../../../models');

export const requestResetPassword = {
  path: '/web/auth/accounts/external/password/requests',
  method: 'post',
  checkToken: false,
  roles: [],
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request: Request, response: Response, next: NextFunction) {
  const loggerService = new LoggerService();
  try {
    const { body } = request;

    if (!body || !body.email) {
      throw 'INPUT_INVALID';
    }

    const email = body.email.toString().trim() || '';

    const userType = USER_TYPE.EXTERNAL.toUpperCase();

    await models.sequelize.transaction(async (t: Transaction) => {
      const user = await models.UsersNew.findOne({
        where: {
          [Op.and]: [
            {
              accountId: email,
            },
            {
              type: userType,
            },
          ],
        },
      });

      if (!user) {
        throw 'USER_IS_NOT_FOUND';
      }

      const token = genResetPasswordToken(user.accountId);
      await models.UsersNew.update(
        {
          resetPasswordToken: token,
        },
        {
          where: {
            id: user.id,
          },
        },
        { transaction: t }
      );
      await sendResetPasswordEmail(user.accountId, token, loggerService);
    });

    return response.status(HTTP_STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    console.log('error::', error);

    if (error instanceof Error) {
      return next('ERROR_WHILE_REQUEST_FIND_PASSWORD');
    }
    return next(error);
  }
}

function validator(request: Request, response: Response, next: NextFunction) {
  next();
}

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  if (error === 'INPUT_INVALID') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유효하지 않은 값입니다.',
    });
  }

  if (error === 'USER_IS_NOT_FOUND') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일이 존재하지 않습니다. 다시 확인해주세요',
    });
  }

  if (error === 'ERROR_WHILE_REQUEST_FIND_PASSWORD') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '오류가 발생하였습니다.',
    });
  }
  next();
}

export function genResetPasswordToken(email: string) {
  const dateStr = new Date().toISOString().split('T')[0];
  const concatenatedStr = `${email}${dateStr}`;
  return createHash('sha256').update(concatenatedStr).digest('hex');
}

export async function sendResetPasswordEmail(email: string, token: string, loggerService: LoggerService) {
  const config = configuration();

  const emailService = new EmailService(config, loggerService);
  const subject = 'EV&U 비밀번호 설정';
  const resetPasswordUrl = `${config.webAdminUrl}/password_reset?email=${email}&token=${token}`;
  // const message = createPasswordResetEmailContent(resetPasswordUrl);
  // const message = `비밀번호 설정을 하기 위해 해당 링크를 클릭하세요 \n: ${resetPasswordUrl}`;

  await emailService.sendWithTemplateTemp(email, subject, resetPasswordUrl);
}
