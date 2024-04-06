'use strict';
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { Stream } = require('stream');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/view-file'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    const filePath = _request.query.path;
    const fileName = filePath?.split('/')?.pop() || '';

    if (!filePath || !fileName) {
      return next('FILE_NAME_NOT_EXISTS');
    }

    const region = process.env.AWS_REGION;

    const s3Client = new S3Client({
      region: region,
    });

    const params = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
    });

    const data = await s3Client.send(params);
    if (!data) {
      return next('FILE_NAME_NOT_EXISTS');
    }

    const fileBuffer = await data.Body.transformToByteArray();

    const isImage = data.ContentType.startsWith('image/');

    if (isImage) {
      _response.set('Content-Type', data.ContentType);
      _response.end(fileBuffer);
    } else {
      _response.set('Content-disposition', 'inline; filename=' + fileName);
      _response.set('Content-Type', 'application/octet-stream');
      const stream = new Stream.PassThrough();
      stream.end(fileBuffer);
      stream.pipe(_response);
    }

    return;
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
    _response.error.notFound(_error, 'Cannot access AWS resources. Please check your authentication information.');
    return;
  }

  if (_error === 'FILE_NAME_NOT_EXISTS') {
    _response.error.notFound(_error, 'File is not exists');
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
