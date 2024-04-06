const { exec } = require('child_process');
const os = require('os');
const dns = require('dns');
const winston = require('winston');
const { USER_TYPE } = require('../../util/tokenService');
const path = require('path');
const fs = require('fs');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});

module.exports = {
  path: ['/curlMail-service'],
  method: 'post',
  checkToken: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  console.log('확인');
  const { userEmail, sendEmailAdd, userInfo, template, host, port, secure } = _request.body;
  const emailContent = `Subject: 테스트 이메일입니다.
  From: no-reply@bp.hd.com
  To: ${sendEmailAdd}
  Content-Type: text/html; charset=UTF-8
  Content-Transfer-Encoding: quoted-printable
  
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>HTML Email Template</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div style="width: 600px; background-color: #fff; font-family: Arial, sans-serif; font-size: 14px; color: #333">
      <div style="height: 4px; background: linear-gradient(90deg, #03a56b 0%, #0582dc 100%)"></div>
      <div style="padding: 30px 40px; border-bottom: 1px solid #f5f5f5">
        <img
          src="https://evnu.oilbank.co.kr/assets/img/Layer_1.png"
          alt="ev&U"
          style="display: block; margin-bottom: 14px"
        />
        <img src="https://evnu.oilbank.co.kr/assets/img/title.png" alt="비밀번호 설정" style="display: block" />
      </div>
      <div style="padding: 30px 40px; border-bottom: 1px solid #f5f5f5">
        <p
          style="
            font-size: 24px;
            line-height: 32px;
            color: #03a56b;
            letter-spacing: -1px;
            font-weight: 600;
            margin-bottom: 0;
          "
        >
          EV&U
        </p>
        <p
          style="
            font-size: 24px;
            line-height: 32px;
            color: #4a4b4d;
            letter-spacing: -1px;
            font-weight: 600;
            margin-bottom: 40px;
          "
        >
          아래 링크를 통해 비밀번호 설정 후 <br />
          정상적으로 사용 가능합니다.
        </p>
        <div style="margin-bottom: 10px">
          <a
            href="{{userUrl}}"
            target="_blank"
            style="
              background: #03a56b;
              color: #ffffff;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              display: inline-block;
            "
          >
            비밀번호 설정하기
          </a>
        </div>
        <p style="color: #f4351b; font-size: 14px; margin: 0; line-height: 17px">비밀번호 설정은 1번만 가능합니다.</p>
      </div>
      <div style="background: #f5f6f6; padding: 30px 40px">
        <p style="color: #949596; margin: 0; line-height: 20px">
          본 메일은 협력사 회원가입을 정상적으로 처리하기 위해 이메일 수신동의 여부에 상관없이 발송됩니다.
        </p>
        <p style="color: #949596; margin: 0; line-height: 20px">
          본 메일은 발송 전용으로 회신이 불가하오니, 문의사항은 고객센터(1551-5129)를 이용해 주시기 바랍니다.
        </p>
      </div>
    </div>
  </body>
  </html>`;

  const processedContent = emailContent.replace(/{{userUrl}}/g, 'https://evnu.oilbank.co.kr/');
  const emailFolderPath = path.join(__dirname, 'mailTemplate');
  const tempFileName = `email_${Date.now()}.txt`;

  const tempFilePath = path.join(emailFolderPath, tempFileName);
  try {
    fs.writeFileSync(tempFilePath, processedContent);
  } catch (error) {
    logger.error(`파일 쓰기 실패: ${error.message}`);
    _response.status(500).json({ error: `파일 쓰기 실패: ${error.message}` });
    return;
  }
  const emailBody = fs.readFileSync(tempFilePath, 'utf8');
  console.log(emailBody);
  // curl 명령 구성
  let curlCommand = `curl -v --url "smtp://${host}:${port}" --mail-from "${userEmail}" --mail-rcpt "${sendEmailAdd}" --upload-file "${tempFilePath}" --header "Content-Type: text/html; charset=UTF-8" --header "Content-Transfer-Encoding: quoted-printable"`;
  if (userInfo) {
    curlCommand = `curl --url "smtps://smtp.gmail.com:465" --ssl-reqd --mail-from "${userEmail}" --mail-rcpt "${sendEmailAdd}" --upload-file "${tempFilePath}" --user "dlswn666@caelumglobal.com:cvnd fois venf nrmu" --header "Content-Type: text/html; charset=UTF-8"`;
  }

  // curl 명령 실행
  exec(curlCommand, (error, stdout, stderr) => {
    // 로그와 응답 처리
    if (error) {
      logger.error(`exec error: ${error}`);
      _response.status(500).json({ error: error.message, stderr: stderr, stdout: stdout, curl: curlCommand });
    } else {
      logger.info(`stdout: ${stdout}`);
      if (stderr) {
        logger.error(`stderr: ${stderr}`);
      }
      _response
        .status(200)
        .json({ message: '메일 전송 성공', stdout: stdout, stderr: stderr, curl: curlCommand, emailBody: emailBody });
      // 임시 파일 삭제
      fs.unlink(tempFilePath, (unlinkError) => {
        if (unlinkError) {
          console.error(`임시 파일 삭제 실패: ${unlinkError}`);
        }
      });
    }
  });
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  _response.status(500).json({ error: '서버 내부 오류' });
}
