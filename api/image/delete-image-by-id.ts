/**
 * Created by Jackie Yoon on 2023-06-05.
 * 이미지 아이디로 삭제 API
 */

import { NextFunction, Request, Response } from 'express';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { USER_TYPE } from '../../util/tokenService';
const { USER_ROLE } = require('../../middleware/role.middleware');

module.exports = {
  path: '/images/:imageId',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request: Request, _response: Response, next: NextFunction) {
  const imageId = _request.params.imageId; // Path파라메터로 전달된 imageId
  const bucketName = process.env.S3_BUCKET_NAME;

  // AWS 인증정보 로드
  const accessKeyId = process.env.AWS_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  // S3 버킷정보 구성
  const s3Client = new S3Client({
    region: region
  });

  const filePath = `upload/${imageId}`;
  const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    })
  );

  _response.json({
    status: '200',
    result: {
      imageId: imageId,
      url: url,
    },
  });
}

function validator(_request: Request, _response: Response, next: NextFunction) {
  next();
}

function errorHandler(_error: any, _request: Request, _response: Response, next: NextFunction) {
  console.error(_error);

  if (_error.code === 404 && _error.message === 'Not Found') {
    _response.error.notFound(_error, '해당 imageId에 대한 이미지를 찾을 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
