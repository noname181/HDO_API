const { HTTP_STATUS_CODE, USER_ROLE } = require('../../../../../middleware/role.middleware');
const models = require('../../../../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../../../../util/tokenService');
const { transformUser } = require('../../../../mobileControllers/user/transformUser/transformUser');
const { responseFields } = require('../../../user/getUsers/getUsers');
const { USER_STATUS } = require('../../../user/updateUserByAdmin/updateUserByAdmin');
const { LoggerService } = require('../../../../../services/loggerService/loggerService');
const { EmailService } = require('../../../../../services/emailService/emailService');
const { configuration } = require('../../../../../config/config');
const { PERMISSION_NAME } = require('../../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../../middleware/newRole.middleware');
const { genResetPasswordToken } = require('../requestResetPassword/requestResetPassword');

const approveCreateAccount = {
  path: '/web/auth/accounts/external/approve',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.client],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const loggerService = new LoggerService();
  const { body, user: authUser } = request;

  if (!body.user || !Array.isArray(body.user) || body.user.length === 0) {
    return next('INPUT_INVALID');
  }
  try {
    const ids = body.user.map((item) => item.id);

    const users = await models.UsersNew.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

    await Promise.all(
      users.map(async (user) => {
        if (!user || !user.accountId || !user.email) {
          throw 'USER_IS_NOT_EXISTS';
        }

        if (user.type !== USER_TYPE.EXTERNAL.toUpperCase()) {
          throw 'USER_NOT_IS_EXTERNAL_ACCOUNT';
        }

        if (user.isEmailVerified) {
          throw 'USER_IS_VERIFIED';
        }

        if (user.status === 'SLEEP') {
          throw 'SLEEP_USER';
        }

        if (user.status === 'BLOCK') {
          throw 'BLOCK_USER';
        }
      })
    );

    const result = await Promise.all(
      users.map(async (user) => {
        const email = user.email || user.accountId;
        const token = genResetPasswordToken(email);

        const config = configuration();
        const emailService = new EmailService(config, loggerService);
        const subject = 'EV&U 비밀번호 설정';
        const resetPasswordUrl = `${config.webAdminUrl}/password_reset?email=${email}&token=${token}`;
        // const message = createPasswordResetEmailContent(resetPasswordUrl);
        // const message = `비밀번호 설정을 하기 위해 해당 링크를 클릭하세요 \n: ${resetPasswordUrl}`;

        const emailResult = await emailService.sendWithTemplateTemp(email, subject, resetPasswordUrl);
        const userType =
          Object.values(USER_TYPE).find((item) => item.toUpperCase() === user.type) || USER_TYPE.EXTERNAL;

        await models.UsersNew.update(
          {
            verifyEmailSendedAt: new Date(),
            resetPasswordToken: token,
          },
          {
            where: {
              id: user.id,
            },
          }
        );

        const userUpdated = await user.reload();
        const userRes = transformUser({
          fields: responseFields[userType],
          user: userUpdated,
        });
        return {
          ...userRes,
          verifyEmailSendedAt: userUpdated.verifyEmailSendedAt,
        };
        //await sendResetPasswordEmail(email, token, loggerService);
      })
    );
    return response.status(HTTP_STATUS_CODE.OK).json(result);
  } catch (error) {
    console.error('error::approveCreateAccount::service', error);
    return next(error);
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'INPUT_INVALID') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유효하지 않은 값입니다.',
    });
  }

  if (error === 'USER_ID_IS_EMPTY') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유저ID가 입력되지 않았습니다.',
    });
  }

  if (error === 'USER_IS_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '회원이 없습니다.',
    });
  }

  if (error === 'USER_NOT_IS_EXTERNAL_ACCOUNT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '외부 관리자가 아닙니다.',
    });
  }

  if (error === 'USER_IS_VERIFIED') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '사용자가 확인되었습니다.',
    });
  }

  if (error === 'SLEEP_USER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이미 탈퇴한 회원입니다.',
    });
  }

  if (error === 'BLOCK_USER') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '로그인 오류!(블락된 사용자).',
    });
  }

  if (error === 'APPROVE_ERROR') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '외부 관리자 승인 시 발생한 에러입니다.',
    });
  }

  if (error === 'E') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일 발송 에러입니다',
    });
  }
  if (error === 'CE') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '이메일 서버 접속 문제입니다',
    });
  }

  next();
}

// async function sendResetPasswordEmail(email, token, loggerService) {
//   const config = configuration();
//   const emailService = new EmailService(config, loggerService);
//   const subject = '이메일 확인';
//   const resetPasswordUrl = `${config.webAdminUrl}/password_reset?email=${email}&token=${token}`;
//   const message = createPasswordResetEmailContent(resetPasswordUrl);
//   // const message = `비밀번호 설정을 하기 위해 해당 링크를 클릭하세요 \n: ${resetPasswordUrl}`;

//   await emailService.send(email, subject, message);
// }

function createPasswordResetEmailContent(messagePassword) {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>HTML Email Template</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
          <div style="width: 600px; background-color: #fff; font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            <div style="height: 4px; background: linear-gradient(90deg, #03A56B 0%, #0582DC 100%);"></div>
            <div style="padding: 30px 40px; border-bottom: 1px solid #F5F5F5;">
                <img src="https://evnu.oilbank.co.kr/assets/img/Layer_1.png" alt="ev&U" style="display: block; margin-bottom: 14px;">
                <img src="https://evnu.oilbank.co.kr/assets/img/title.png" alt="비밀번호 설정" style="display: block;">
            </div>
            <div style="padding: 30px 40px; border-bottom: 1px solid #F5F5F5;">
              <p style="font-size: 24px; line-height: 32px; color: #03A56B; letter-spacing: -1px; font-weight: 600; margin-bottom: 0;">
                EV&U
              </p>
              <p style="font-size: 24px; line-height: 32px; color: #4A4B4D; letter-spacing: -1px; font-weight: 600; margin-bottom: 40px;">
                아래 링크를 통해 비밀번호 설정 후 <br/> 정상적으로 사용 가능합니다.
              </p>
              <div style="margin-bottom: 10px;">
                <a href="${messagePassword}" target="_blank" style="background: #03A56B; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  비밀번호 설정하기
                </a>
              </div>
              <p style="color: #F4351B; font-size: 14px; margin: 0; line-height: 17px;">
                비밀번호 설정은 1번만 가능합니다.
              </p>
            </div>
            <div style="background: #F5F6F6; padding: 30px 40px;">
              <p style="color: #949596; margin: 0; line-height: 20px;">
                본 메일은 협력사 회원가입을 정상적으로 처리하기 위해 이메일 수신동의 여부에 상관없이 발송됩니다.
              </p>
              <p style="color: #949596; margin: 0; line-height: 20px;">
                본 메일은 발송 전용으로 회신이 불가하오니, 문의사항은 고객센터(1551-5129)를 이용해 주시기 바랍니다.
              </p>
            </div>
          </div>
      </body>
  </html>
  `;
}

module.exports = { approveCreateAccount };
