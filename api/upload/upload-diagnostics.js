'use strict';
const multer = require('multer');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { Stream } = require('stream');
const { USER_TYPE } = require('../../util/tokenService');
const { UploadService } = require('../../services/uploadService/uploadService');
const { configuration } = require('../../config/config');

const fileSize = 2000 * 1024 * 1024; // 15MB까지 메모리 cache 허용
const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: fileSize } });

module.exports = {
  path: ['/upload-diagnostics', '/upload-diagnostics/:fileNameParam(*)'],
  method: 'post',
  checkToken: false,
  multer: m.single('file'),
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const file = _request?.file;
    const fileName = _request?.body?.filename ? _request?.body?.filename : '';
    const filePath = _request?.query?.path || _request.params.fileNameParam;

    console.log('Request Body:', _request?.body);
    console.log('Request Query:', _request?.query);
    console.log('file:', _request?.file);
    console.log('fileName:', _request?.fileName);
    console.log('filePath:', filePath);

    if (!file) throw 'NOT_EXIST_FILE';
    if (file.fieldname !== 'file') throw 'NOT_VALID_FORM_DATA';
    if (file.size >= fileSize) throw 'FILE_SIZE_OVER';

    const config = configuration();
    const uploadService = new UploadService(config);

    const result = await uploadService.uploadChargerDiagnostics(file, filePath, fileName);
    console.log('Upload Result : ', result);

    if (result) {
      const { filePath, url } = result;

      _response.json({
        deploy: true,
        status: '200',
        result: {
          url: url,
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
    return;
  }

  if (_error === 'NOT_EXIST_FILE') {
    _response.error.notFound(_error, 'File is not exists');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
