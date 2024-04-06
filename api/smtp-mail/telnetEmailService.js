const { exec } = require('child_process');
const winston = require('winston');
const fs = require('fs');
const net = require('net');
const client = new net.Socket();

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
  path: ['/telnetMail-service'],
  method: 'post',
  checkToken: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  console.log('확인');
  const { userEmail, sendEmailAdd, userInfo, template, host, port, secure } = _request.body;
  const subject = 'telnet 테스트 이메일입니다.';
  const message = `<html xmlns="http://www.w3.org/1999/xhtml">
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

  client.connect(port, host, () => {
    console.log('Connected to SMTP server.');
    try {
      // SMTP 서버에 HELO 명령을 보냅니다
      client.write('HELO localhost\r\n');
      console.log('HELO localhost\r\n');
    } catch (error) {
      console.error('Error sending HELO command:', error);
      client.end();
      console.log('client.end();');
      client.destroy();
      console.log('client.destroy();');
    }
  });

  client.on('data', (data) => {
    console.log('Received: ' + data.toString());

    try {
      if (data.toString().includes('220') || data.toString().includes('250')) {
        if (!client.mailFrom) {
          client.mailFrom = true;
          client.write(`MAIL FROM:<${userEmail}>\r\n`);
          console.log(`MAIL FROM:<${userEmail}>\r\n`);
        } else if (!client.rcptTo) {
          client.rcptTo = true;
          client.write(`RCPT TO:<${sendEmailAdd}>\r\n`);
          console.log(`RCPT TO:<${sendEmailAdd}>\r\n`);
        } else if (!client.data) {
          client.data = true;
          client.write('DATA\r\n');
          console.log('DATA\r\n');
        } else if (!client.message) {
          client.message = true;
          client.write('MIME-Version: 1.0\r\n');
          client.write('Content-Type: text/html; charset=UTF-8\r\n');
          client.write(`From: ${userEmail}\r\n`);
          client.write(`To: ${sendEmailAdd}\r\n`);
          client.write(`Subject: ${subject}\r\n\r\n`);
          client.write(`${message}\r\n.\r\n`);
          console.log('MIME-Version: 1.0\r\n');
          console.log('Content-Type: text/html; charset=UTF-8\r\n');
          console.log(`From: ${userEmail}\r\n`);
          console.log(`To: ${sendEmailAdd}\r\n`);
          console.log(`Subject: ${subject}\r\n\r\n`);
          console.log(`${message}\r\n.\r\n`);
        }
      } else if (data.toString().includes('354')) {
        client.write('QUIT\r\n');
      } else if (data.toString().includes('221')) {
        client.end(); // 세션을 종료하는 서버 응답 후 연결을 종료합니다.
        client.destroy();
      } else {
        console.error('Invalid logic performed');
        client.end(); // 에러 발생 시 연결을 종료합니다.
        client.destroy();
      }
    } catch (error) {
      console.error('Error during SMTP transaction:', error);
      client.end(); // 에러 발생 시 연결을 종료합니다.
      client.destroy();
    }
  });

  client.on('end', () => {
    console.log('SMTP connection ended by the client.');
  });

  client.on('error', (error) => {
    console.error('Error with SMTP connection:', error);
    client.end(); // 네트워크 에러 발생 시 연결을 종료합니다.
    client.destroy();
  });
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  _response.status(500).json({ error: '서버 내부 오류' });
}
