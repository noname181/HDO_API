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
 * Created by Jackie Yoon on 2023-06-02.
 * 이미지 추가 API
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
  path: ['/upload-file'],
  method: 'post',
  checkToken: false,
  multer: m.single('file'),
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

// function service(_request, _response, next) {
//   _response.setHeader("Content-Type", "application/json; charset=utf-8");
//   return __awaiter(this, void 0, void 0, function* () {
//     try {
//       // TODO dev 및 prod용 S3 버킷 분기처리
//       const file = _request.file;
//       const body = _request.body.params;
//       const obj = JSON.parse(body);
//       const paramFileName = obj.fileName;

//         if (!file) throw "NOT_EXIST_FILE";
//         if (file.fieldname !== "file") throw "NOT_VALID_FORM_DATA";
//         const filename =
//           new Date(Date.now()).toISOString().replace(/\D/g, "").slice(0, -1) +
//           "_" +
//           paramFileName;
//         console.log('file.originalname : ', paramFileName);
//         const filePath = "upload/" + filename;
//         const fileBuffer = yield stream_1.Readable.from(file.buffer).read();
//         const fileType = file.mimetype;
//         if (file.size >= fileSize) throw "FILE_SIZE_OVER";

//         const bucketName = "hdoev-asset-dev";

//         // AWS 인증정보 로드
//         const accessKeyId = process.env.AWS_ACCESS_KEY;
//         const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
//         const region = process.env.AWS_REGION;
//         if (!accessKeyId || !secretAccessKey || !region)
//           throw "NOT_EXIST_AWS_ACCOUNT_INFO";

//         // S3 버킷정보 구성
//         const s3Client = new client_s3_1.S3Client({
//           region: region,
//           credentials: {
//             accessKeyId: accessKeyId,
//             secretAccessKey: secretAccessKey,
//           },
//         });

//         // S3 버킷에 파일 전송
//         yield s3Client.send(
//           new client_s3_1.PutObjectCommand({
//             Bucket: bucketName,
//             Key: filePath,
//             Body: fileBuffer,
//             // ContentType: 'image/png'
//             ContentType: file.mimetype,
//           })
//         );

//         if (file.size >= fileSize) throw "FILE_SIZE_OVER";

//         if (fileType.includes("-zip-")) {
//           const url =
//             "https://" +
//             bucketName +
//             ".s3." +
//             process.env.AWS_REGION +
//             ".amazonaws.com/upload/" +
//             filename;

//           _response.json({
//             'result': {
//               id: filename,
//               url: url,
//             }
//           });
//         } else if (fileType.includes("text/")) {
//           const url =
//             "https://" +
//             bucketName +
//             ".s3." +
//             process.env.AWS_REGION +
//             ".amazonaws.com/upload/" +
//             filename;

//           _response.json({
//             'result': {
//               id: filename,
//               url: url,
//             }
//           });
//         } else {
//           throw "NOT_VALID_MIME_TYPE";
//         }
//     } catch (e) {
//       next(e);
//     }
//     _response.json({
//       result: "success"
//     })
//   });
// }
const uploadToS3 = async (bucketName, filePath, fileBuffer, fileMimetype) => {
  // AWS 인증정보 로드
  const accessKeyId = process.env.AWS_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  const s3Client = new client_s3_1.S3Client({
    region: region
  });

  try {
    // S3 버킷에 파일 전송
    await s3Client.send(
      new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: fileMimetype,
      })
    );

    return true;
  } catch (error) {
    throw new Error('S3_UPLOAD_FAILED');
  }
};
function getUrl(bucketName, region, filePath) {
  return `https://${bucketName}.s3.${region}.amazonaws.com/upload/${filePath}`;
}
async function service(_request, _response, next) {
  _response.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const file = _request.file;
    const body = _request.body.params;
    const obj = JSON.parse(body);
    const paramFileName = obj.fileName;

    if (!file) throw new Error('NOT_EXIST_FILE');
    if (file.fieldname !== 'file') throw new Error('NOT_VALID_FORM_DATA');

    const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + paramFileName;
    const filePath = filename;
    const fileBuffer = await stream_1.Readable.from(file.buffer).read();
    const fileType = file.mimetype;
    const fileSize = 15 * 1024 * 1024;

    if (fileBuffer.length >= fileSize) throw new Error('FILE_SIZE_OVER');

    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    await uploadToS3(bucketName, filePath, fileBuffer, file.mimetype);

    const url = getUrl(bucketName, region, filePath);

    if (fileType.includes('-zip-') || fileType.includes('text/')) {
      _response.json({
        result: {
          id: filename,
          url: url,
        },
      });
    } else {
      throw new Error('NOT_VALID_MIME_TYPE');
    }
  } catch (e) {
    next(e);
  }
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
