import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { USER_TYPE } from '../../util/tokenService';
const { USER_ROLE } = require('../../middleware/role.middleware');

const fileSize = 2000 * 1024 * 1024;
const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: fileSize } }).array('files', 5); // Tải lên nhiều tệp với tên trường "files" và giới hạn 5 tệp

module.exports = {
  path: ['/uploads-many'],
  method: 'post',
  checkToken: true,
  multer: m,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(req: Request, res: Response, next: NextFunction) {
  try {
    const files: any = req.files;
    if (!files || files.length === 0) throw 'NOT_EXIST_FILES';

    const uploadPromises = files.map((file: Express.Multer.File) => {
      if (file.fieldname !== 'files') throw 'NOT_VALID_FORM_DATA';

      const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + file.originalname;
      const filePath = 'upload/' + filename;
      const fileBuffer = file.buffer;
      const fileType = file.mimetype;

      if (file.size >= fileSize) throw 'FILE_SIZE_OVER';

      const bucketName = process.env.S3_BUCKET_NAME;
      const accessKeyId = process.env.AWS_ACCESS_KEY;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION;

      const s3Client = new S3Client({
        region: region,
      });

      return s3Client
        .send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            Body: fileBuffer,
            ContentType: file.mimetype,
          })
        )
        .then(async () => {
          const url = 'https://' + bucketName + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/upload/' + filename;
          return {
            id: filePath,
          };
        });
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      status: '200',
      result: uploadedFiles,
    });
  } catch (e) {
    next(e);
  }
}

function validator(req: Request, res: Response, next: NextFunction) {
  next();
}

function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  console.error(error);

  if (error === 'NOT_EXIST_AWS_ACCOUNT_INFO') {
    res.status(404).json({ error: error, message: 'AWS 리소스에 액세스할 수 없습니다. 인증정보를 확인해 주세요.' });
    return;
  }

  if (error === 'NOT_EXIST_FILES') {
    res
      .status(404)
      .json({ error: error, message: '파일이 첨부되지 않았습니다. file FormData에 파일을 첨부하여 호출해 주십시오.' });
    return;
  }

  if (error === 'NOT_VALID_FORM_DATA') {
    res.status(400).json({ error: error, message: '파일이 file라는 Key 또는 FormData에 첨부되지 않았습니다' });
    return;
  }

  if (error === 'FILE_SIZE_OVER' || (error.message && error.message === 'File too large')) {
    res.status(400).json({ error: error, message: '파일 사이즈는 2GB 이하만 가능합니다.' });
    return;
  }

  res.status(500).json({ error: error, message: 'unknow error.' });
  next(error);
}
