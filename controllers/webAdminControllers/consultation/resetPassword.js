const { PasswordService } = require('../../../util/passwordService');
const models = require('../../../models');
const { configuration } = require('../../../config/config');
const { sendTalkAndLms } = require('../../../util/sendTalkAndLmsUtil');
const { sendResetPassWordMsg } = require('../../../util/notificationTalk/notificationTemplate');

const resetPassword = {
  path: '/web/auth/reset-password',
  method: 'put',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const config = configuration();
  try {
    const { user_id, phoneNo } = request.body;
    const csId = request?.user?.id;

    if (!user_id) {
      response.status(400).json({
        status: '400',
        message: '사용자 ID가 필요합니다.',
      });
      return;
    }

    if (!phoneNo) {
      response.status(400).json({
        status: '400',
        message: '사용자 전화번호가 필요합니다.',
      });
      return;
    }

    const user = await models.UsersNew.findOne({
      where: { accountId: user_id },
    });

    if (!user) {
      return next('USER_NOT_FOUND');
    }

    const temporaryPassword = generateComplexPassword();
    const sendResetPassWordMsgData = sendResetPassWordMsg(temporaryPassword);

    const sendRes = await sendTalkAndLms(
      user?.phoneNo,
      sendResetPassWordMsgData?.message,
      sendResetPassWordMsgData?.templateCode
    );
    const resData = sendRes?.data[0];
    const resCode = resData?.code;

    if (resCode === 'AS' || resCode === 'EW' || resCode === 'SS') {
      const passwordService = new PasswordService(config);
      const { salt, passwordHashed } = await passwordService.hash(temporaryPassword);

      // 해싱된 비밀번호를 사용자의 레코드에 저장합니다.
      const result = await models.UsersNew.update(
        { saltRounds: salt, hashPassword: passwordHashed },
        { where: { accountId: user_id } }
      );
      console.log('비밀번호 업데이트 확인 필요', result);

      // 성공 메시지를 반환합니다.
      response.json({
        status: '200',
        message: '비밀번호가 초기화되었습니다.',
      });
    } else {
      response.json({
        status: '503',
        message: '비밀번호 초기화 문자를 보내는 데 실패했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
  } catch (error) {
    next(error);
  }
}

function generateComplexPassword() {
  const passwordLength = 12;
  const numberChars = '0123456789';
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const specialChars = '!@#$%^&*';
  const allChars = numberChars + upperChars + lowerChars + specialChars;
  const passwordArray = [
    numberChars[Math.floor(Math.random() * numberChars.length)],
    upperChars[Math.floor(Math.random() * upperChars.length)],
    lowerChars[Math.floor(Math.random() * lowerChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  // 나머지 비밀번호 문자를 채우기
  for (let i = 4; i < passwordLength; i++) {
    passwordArray.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // 배열의 순서를 무작위로 섞기
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

async function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  console.error('Error:', error);
  response.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
}

// 모듈을 내보냅니다.
module.exports = { resetPassword };
