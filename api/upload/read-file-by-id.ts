/**
 * Migrated by Sarc Bae on 2023-08-08
 * 파일 아이디로 조회 API
 */
import { Request, Response, NextFunction } from 'express';
import { USER_TYPE } from '../../util/tokenService';
const { USER_ROLE } = require('../../middleware/role.middleware');
const axios = require('axios');

module.exports = {
  path: '/uploads/:id',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request: Request, _response: Response, next: NextFunction) {
  try {
    const id = _request.params.id; // Path파라메터로 전달된 id
    const bucketName = process.env.S3_BUCKET_NAME;

    const filePath = `upload/${id}`;
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`;

    const file = await axios({
      url: url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    _response
      .status(200)
      .set('Content-Type', file.headers['content-type'])
      .set('Content-Length', file.headers['content-length'])
      .set('Cache-Control', 'public, max-age=2592000')
      .end(file.data, 'binary');
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
    _response.error.notFound(_error, '해당 파일이 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
