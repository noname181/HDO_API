/**
 * Migrated by Sarc Bae on 2023-08-08
 * 파일 추가 API
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const multer = require('multer');
import { Request, Response, NextFunction } from 'express';
const { USER_ROLE } = require('../../middleware/role.middleware');
import { Readable } from 'stream'; // parameter type 명시를 위해 추가
import { USER_TYPE } from '../../util/tokenService';
import { UploadService } from '../../services/uploadService/uploadService';
import { configuration } from '../../config/config';

const fileSize = 2000 * 1024 * 1024; // 15MB까지 메모리 cache 허용
const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: fileSize } });

module.exports = {
  path: ['/uploads'],
  method: 'post',
  checkToken: true,
  multer: m.single('file'),
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request: Request, _response: Response, next: NextFunction) {
  try {
    const file = _request.file;
    if (!file) throw 'NOT_EXIST_FILE';
    if (file.fieldname !== 'file') throw 'NOT_VALID_FORM_DATA';

    // const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + file.originalname;
    // const filePath = 'upload/' + filename;

    // if (!fileType.includes('file/')) throw 'NOT_VALID_MIME_TYPE';
    if (file.size >= fileSize) throw 'FILE_SIZE_OVER';

    // const bucketName = process.env.S3_BUCKET_NAME;

    // AWS 인증정보 로드
    // const accessKeyId = process.env.AWS_ACCESS_KEY;
    // const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    // const region = process.env.AWS_REGION;

    // if (!accessKeyId || !secretAccessKey || !region) throw 'NOT_EXIST_AWS_ACCOUNT_INFO';

    // // S3 버킷정보 구성
    // const s3Client = new S3Client({
    //   region: region,
    //   credentials: {
    //     accessKeyId: accessKeyId,
    //     secretAccessKey: secretAccessKey,
    //   },
    // });

    // S3 버킷에 파일 전송
    // await s3Client.send(
    //   new PutObjectCommand({
    //     Bucket: bucketName,
    //     Key: filePath,
    //     Body: file.buffer,
    //     // ContentType: 'image/png'
    //     ContentType: file.mimetype,
    //   })
    // );

    // const url = 'https://' + bucketName + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/upload/' + filename;
    const config = configuration();
    const uploadService = new UploadService(config);
    const encodedFileName = _request.headers['content-disposition'] as any;
    const decodedFileName = decodeURIComponent(encodedFileName?.split("filename*=UTF-8''")[1]);
    const isValid = /^[\x00-\x7F]*$/.test(file.originalname);
    let splitName = file.originalname.split('.');
    splitName.pop();
    const fileName = isValid ? splitName.join('.') : decodedFileName;

    const result = await uploadService.uploadImage(file, false, fileName, !isValid);
    if (result) {
      const { filePath, url } = result;

      _response.json({
        deploy: true,
        status: '200',
        result: {
          id: filePath,
        },
      });
    } else {
      _response.json({
        deploy: true,
        status: '200',
        result: null,
      });
    }
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
    _response.error.notFound(_error, '파일이 첨부되지 않았습니다. file FormData에 파일을 첨부하여 호출해 주십시오.');
    return;
  }

  if (_error === 'NOT_VALID_FORM_DATA') {
    _response.error.badRequest(_error, '파일이 file라는 Key 또는 FormData에 첨부되지 않았습니다.');
    return;
  }

  // if (_error === 'NOT_VALID_MIME_TYPE') {
  //     _response.error.badRequest(_error, '파일만 첨부 가능합니다.');
  //     return;
  // }

  if (_error === 'FILE_SIZE_OVER' || (_error.message && _error.message === 'File too large')) {
    _response.error.badRequest(_error, '파일 사이즈는 2GB 이하만 가능합니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
