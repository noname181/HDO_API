/**
 * Created by Jackie Yoon on 2023-06-02.
 * 이미지 추가 API
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const multer = require('multer');
import { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream'; // parameter type 명시를 위해 추가
import { USER_TYPE } from '../../util/tokenService';
const { USER_ROLE } = require('../../middleware/role.middleware');

const fileSize = 15 * 1024 * 1024; // 15MB까지 메모리 cache 허용
const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: fileSize } });

module.exports = {
  path: ['/images'],
  method: 'post',
  checkToken: true,
  multer: m.single('image'),
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request: Request, _response: Response, next: NextFunction) {
  try {
    const file = _request.file;
    if (!file) throw 'NOT_EXIST_FILE';
    if (file.fieldname !== 'image') throw 'NOT_VALID_FORM_DATA';

    const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + file.originalname;
    const filePath = 'upload/' + filename;
    const fileBuffer = await Readable.from(file.buffer).read();
    const fileType = file.mimetype;

    if (!fileType.includes('image/')) throw 'NOT_VALID_MIME_TYPE';
    if (file.size >= fileSize) throw 'FILE_SIZE_OVER';

    const bucketName = process.env.S3_BUCKET_NAME;

    // AWS 인증정보 로드
    const accessKeyId = process.env.AWS_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;


    // S3 버킷정보 구성
    const s3Client = new S3Client({
      region: region
    });

    // S3 버킷에 이미지 전송
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        // ContentType: 'image/png'
        ContentType: file.mimetype,
      })
    );

    const url = 'https://' + bucketName + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/upload/' + filename;

    _response.json({
      status: '200',
      result: {
        id: filename,
        url: url,
      },
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request: Request, _response: Response, next: NextFunction) {
  next();
}

function errorHandler(_error: any, _request: Request, _response: Response, next: NextFunction) {
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
