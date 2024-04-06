'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
/**
 */
const client_s3_1 = require('@aws-sdk/client-s3');
const multer = require('multer');
const stream_1 = require('stream'); // parameter type 명시를 위해 추가
const fileSize = 15 * 1024 * 1024; // 15MB까지 메모리 cache 허용
const m = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: fileSize },
});
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/download'],
  method: 'get',
  checkToken: false,
  multer: m.none,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

function service(_request, _response, next) {
  console.log(_request.body);
  console.log(_request.params);
  console.log(_request.query.fileNameParam);
  console.log(_request);
  return __awaiter(this, void 0, void 0, function* () {
    try {
      // TODO dev 및 prod용 S3 버킷 분기처리
      const bucketName = process.env.S3_BUCKET_NAME;
      const fileName = _request.query.fileNameParam;
      const filePath = fileName;
      // AWS 인증정보 로드
      const accessKeyId = process.env.AWS_ACCESS_KEY;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION;
      // S3 버킷정보 구성
      const s3Client = new client_s3_1.S3Client({
        region: region
      });
      const params = {
        Bucket: bucketName,
        Key: filePath,
      };
      // S3 버킷에서 파일 다운로드
      const { Body } = yield s3Client.send(new client_s3_1.GetObjectCommand(params));

      // 파일 다운로드 헤더 설정
      _response.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}`);
      _response.setHeader('Content-Type', 'application/octet-stream');

      // 파일 스트림 전송
      Body.pipe(_response);

      Body.on('error', (err) => {
        console.error('S3 파일 다운로드 오류:', err);
        next(err);
      });

      _response.on('finish', () => {
        console.log('파일 다운로드 완료');
      });
    } catch (e) {
      next(e);
    }
  });
}
function validator(_request, _response, next) {
  next();
}
function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  if (_error === 'NOT_EXIST_AWS_ACCOUNT_INFO') {
    _response.error.notFound(_error, 'AWS 리소스에 액세스할 수 없습니다. 인증정보를 확인해 주세요.');
    return;
  }
  if (_error === 'NOT_EXIST_FILE') {
    _response.error.notFound(
      _error,
      '파일이 첨부되지 않았습니다. image FormData에 사진파일을 첨부하여 호출해 주십시오.'
    );
    return;
  }
  if (_error === 'NOT_VALID_FORM_DATA') {
    _response.error.badRequest(_error, '파일이 image라는 Key 또는 FormData에 첨부되지 않았습니다.');
    return;
  }
  if (_error === 'NOT_VALID_MIME_TYPE') {
    _response.error.badRequest(_error, '이미지 파일만 첨부 가능합니다.');
    return;
  }
  if (_error === 'FILE_SIZE_OVER' || (_error.message && _error.message === 'File too large')) {
    _response.error.badRequest(_error, '파일 사이즈는 15MB 이하만 가능합니다.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
