"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = require("nodemailer");
const winston = __importStar(require("winston"));
const net = require('net');
const client = new net.Socket();
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), winston.format.printf((info) => {
        const { timestamp, level, message } = info;
        return `${timestamp} ${level}: ${message}`;
    })),
    transports: [new winston.transports.Console()],
});
class EmailService {
    constructor(config, loggerService) {
        this.config = config;
        this.loggerService = loggerService;
        const url = `smtp://${this.config.mailHost}:${this.config.mailPort}`;
        this.loggerService.log('EmailService::url', url);
        this.client = (0, nodemailer_1.createTransport)({
            host: this.config.mailHost,
            port: this.config.mailPort,
            secure: false,
            ignoreTLS: true,
            tls: {
                rejectUnauthorized: false,
            },
            debug: true,
            logger: true,
        });
    }
    //   makeTemplate(receiver: string, subject: string, passwordUrl: string) {
    //     const emailContent = `From: no-reply@bp.hd.com
    // To: ${receiver}
    // Subject: ${subject}
    // Content-Type: text/html; charset=UTF-8
    // Content-Transfer-Encoding: quoted-printable
    // <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    // <html xmlns="http://www.w3.org/1999/xhtml">
    // <head>
    //   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    //   <title>HTML Email Template</title>
    //   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    // </head>
    // <body>
    //   <div style="width: 600px; background-color: #fff; font-family: Arial, sans-serif; font-size: 14px; color: #333">
    //     <div style="height: 4px; background: linear-gradient(90deg, #03a56b 0%, #0582dc 100%)"></div>
    //     <div style="padding: 30px 40px; border-bottom: 1px solid #f5f5f5">
    //       <img
    //         src="https://evnu.oilbank.co.kr/assets/img/Layer_1.png"
    //         alt="ev&U"
    //         style="display: block; margin-bottom: 14px"
    //       />
    //       <img src="https://evnu.oilbank.co.kr/assets/img/title.png" alt="비밀번호 설정" style="display: block" />
    //     </div>
    //     <div style="padding: 30px 40px; border-bottom: 1px solid #f5f5f5">
    //       <p
    //         style="
    //           font-size: 24px;
    //           line-height: 32px;
    //           color: #03a56b;
    //           letter-spacing: -1px;
    //           font-weight: 600;
    //           margin-bottom: 0;
    //         "
    //       >
    //         EV&U
    //       </p>
    //       <p
    //         style="
    //           font-size: 24px;
    //           line-height: 32px;
    //           color: #4a4b4d;
    //           letter-spacing: -1px;
    //           font-weight: 600;
    //           margin-bottom: 40px;
    //         "
    //       >
    //         아래 링크를 통해 비밀번호 설정 후 <br />
    //         정상적으로 사용 가능합니다.
    //       </p>
    //       <div style="margin-bottom: 10px">
    //         <a
    //           href="${passwordUrl}"
    //           target="_blank"
    //           style="
    //             background: #03a56b;
    //             color: #ffffff;
    //             padding: 15px 30px;
    //             text-decoration: none;
    //             border-radius: 6px;
    //             font-weight: bold;
    //             display: inline-block;
    //           "
    //         >
    //           비밀번호 설정하기
    //         </a>
    //       </div>
    //       <p style="color: #f4351b; font-size: 14px; margin: 0; line-height: 17px">비밀번호 설정은 1번만 가능합니다.</p>
    //     </div>
    //     <div style="background: #f5f6f6; padding: 30px 40px">
    //       <p style="color: #949596; margin: 0; line-height: 20px">
    //         본 메일은 협력사 회원가입을 정상적으로 처리하기 위해 이메일 수신동의 여부에 상관없이 발송됩니다.
    //       </p>
    //       <p style="color: #949596; margin: 0; line-height: 20px">
    //         본 메일은 발송 전용으로 회신이 불가하오니, 문의사항은 고객센터(1551-5129)를 이용해 주시기 바랍니다.
    //       </p>
    //     </div>
    //   </div>
    // </body>
    // </html>
    // .
    // `;
    //     return emailContent;
    //   }
    // async send(receiver: string, subject: string, passwordUrl: string) {
    //   const emailContent = this.makeTemplate(receiver, subject, passwordUrl);
    //   const processedContent = emailContent.replace(/{{userUrl}}/g, 'https://evnu.oilbank.co.kr/');
    //   const emailFolderPath = path.join(__dirname, 'mailTemplate');
    //   const tempFileName = `email_${Date.now()}.txt`;
    //   const tempFilePath = path.join(emailFolderPath, tempFileName);
    //   try {
    //     fs.writeFileSync(tempFilePath, processedContent);
    //   } catch (error: any) {
    //     // 타입스크립트에서는 에러 객체에 대한 타입을 any로 설정할 수 있습니다.
    //     logger.error(`파일 쓰기 실패: ${error.message}`);
    //     return;
    //   }
    //   let curlCommand = `curl -v --url "smtp://hdo-nlb-prd-mail-proxy-pri-74003ff96d04ea45.elb.ap-northeast-2.amazonaws.com:25" --mail-from 'no-reply@bp.hd.com' --mail-rcpt "${receiver}" --upload-file "${tempFilePath}" --header "Content-Type: text/html; charset=UTF-8"`;
    //   // curl 명령 실행
    //   exec(curlCommand, (error: Error | null, stdout: string, stderr: string) => {
    //     // 로그와 응답 처리
    //     if (error) {
    //       logger.error(`exec error: ${error}`);
    //     } else {
    //       logger.info(`stdout: ${stdout}`);
    //       if (stderr) {
    //         logger.error(`stderr: ${stderr}`);
    //       }
    //       // 임시 파일 삭제
    //       fs.unlink(tempFilePath, (unlinkError: NodeJS.ErrnoException | null) => {
    //         if (unlinkError) {
    //           console.error(`임시 파일 삭제 실패: ${unlinkError}`);
    //         }
    //       });
    //     }
    //   });
    // }
    sendWithTemplateTemp(receiver, subject, passwordUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const template = this.resetPasswordTemplate(passwordUrl);
            console.log(template);
            const emailOptions = {
                from: this.config.mailSender,
                to: receiver,
                subject,
                html: template,
            };
            try {
                const result = yield this.handleSend(emailOptions);
                console.log(result);
                this.loggerService.log('EmailService::sendWithTemplate::success', result);
            }
            catch (error) {
                this.loggerService.error('EmailService::sendWithTemplate::error', error);
            }
        });
    }
    resetPasswordTemplate(passwordUrl) {
        return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
              href="${passwordUrl}"
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
    }
    handleSend(emailOptions) {
        return new Promise((resolve, reject) => {
            this.client.sendMail(emailOptions, (err, info) => {
                if (err) {
                    this.loggerService.log('EmailService::handleSend::', err);
                    reject(err);
                }
                else {
                    this.loggerService.error('EmailService::handleSend::', info);
                    resolve(info);
                }
            });
        });
    }
}
exports.EmailService = EmailService;
