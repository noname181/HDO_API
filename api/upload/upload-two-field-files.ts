/**
 * Migrated by Sarc Bae on 2023-08-08
 * 파일 추가 API
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const multer = require('multer');
import { Request, Response, NextFunction } from 'express';
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
import { Readable } from 'stream'; // parameter type 명시를 위해 추가
import { USER_TYPE } from '../../util/tokenService';

const fileSize = 2000 * 1024 * 1024; // 15MB까지 메모리 cache 허용
const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: fileSize } }).fields([
  { name: 'file', maxCount: 1 },
  { name: 'files', maxCount: 5 },
]);

module.exports = {
  path: ['/uploads-many-images'],
  method: 'post',
  checkToken: true,
  multer: m,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request: Request, _response: Response, next: NextFunction) {
  try {
    const files: any = _request.files;

    if (!files.file && (!files.files || files.files.length === 0)) throw 'NOT_EXIST_FILES';
    let singleFileData: any = [];
    if (files.file) {
      const singleFile = files.file[0];
      singleFileData = await uploadFiles(singleFile, 'file');
    }

    const multipleFiles = files.files ? files.files : [];
    let multipleFilesData: any = [];
    if (multipleFiles || multipleFiles.length !== 0) {
      multipleFilesData = await Promise.all(multipleFiles.map((file: any) => uploadFiles(file, 'files')));
    }

    _response.status(HTTP_STATUS_CODE.OK).json({
      file: singleFileData,
      files: multipleFilesData,
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

  if (_error === 'NOT_EXIST_FILES') {
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

async function uploadFiles(file: any, fieldname: string) {
  if (file.fieldname !== fieldname) throw 'NOT_VALID_FORM_DATA';
  const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + file.originalname;
  const filePath = 'upload/' + filename;
  const fileBuffer = await Readable.from(file.buffer).read();
  const fileType = file.mimetype;

  // if (!fileType.includes('file/')) throw 'NOT_VALID_MIME_TYPE';
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

  // S3 버킷에 파일 전송
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
  return {
    id: filename,
    url: url,
  };
}
