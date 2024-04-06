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
const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: fileSize } });
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/firmware'],
  method: 'post',
  checkToken: false,
  multer: m.single('file'),
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

function service(_request, _response, next) {
  console.log(_request.body);
  console.log(_request.file);
  return __awaiter(this, void 0, void 0, function* () {
    try {
      // TODO dev 및 prod용 S3 버킷 분기처리
      const file = _request.file;
      if (!file) throw 'NOT_EXIST_FILE';
      if (file.fieldname !== 'file') throw 'NOT_VALID_FORM_DATA';
      const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + file.originalname;
      const filePath = 'upload/' + filename;
      const fileBuffer = yield stream_1.Readable.from(file.buffer).read();
      const fileType = file.mimetype;
      if (!fileType.includes('text/')) throw 'NOT_VALID_MIME_TYPE';
      if (file.size >= fileSize) throw 'FILE_SIZE_OVER';
      const bucketName = process.env.S3_BUCKET_NAME;
      // AWS 인증정보 로드
      const accessKeyId = process.env.AWS_ACCESS_KEY;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION;
      // S3 버킷정보 구성
      const s3Client = new client_s3_1.S3Client({
        region: region
      });
      // S3 버킷에 이미지 전송
      yield s3Client.send(
        new client_s3_1.PutObjectCommand({
          Bucket: bucketName,
          Key: filePath,
          Body: fileBuffer,
          // ContentType: 'image/png'
          ContentType: file.mimetype,
        })
      );
      const url = 'https://' + bucketName + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/upload/' + filename;
      _response.json({
        result: {
          id: filename,
          url: url,
        },
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
