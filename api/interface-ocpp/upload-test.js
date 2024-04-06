"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const fileSize = 2000 * 1024 * 1024;

const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");

const multer = require('multer');
const storage = multer.memoryStorage();
const limits = { fileSize: fileSize };
const m = multer({ storage: storage, limits: limits }).array('files', 5);
const upload = multer({ storage: storage });

module.exports = {
  path: ["/upload-test/:mode"],
  method: "post",
  checkToken: false,
  multer: m,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const mode = request.params.mode;
  try {
    const files = request.files;
    if (!files || files.length === 0) throw 'NOT_EXIST_FILES';
    const uploadPromises = files.map((file) => {
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

      const clientData = {
        region: region,
      }

      const s3Client = new S3Client(clientData)

      return s3Client
          .send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: filePath,
                Body: fileBuffer,
                ContentType: file.mimetype,
              })
          )
          .then(() => {
            const url = 'https://' + bucketName + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/upload/' + filename;
            return {
              id: filename,
              url: url,
            };
          });
    })

    const uploadedFiles = await Promise.all(uploadPromises);
    response.json({
      status: '200',
      result: uploadedFiles,
    });

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
    _response.status(404).json({ error: error, message: 'AWS 리소스에 액세스할 수 없습니다. 인증정보를 확인해 주세요.' });
    return;
  }

  if (_error === 'NOT_EXIST_FILES') {
    _response
        .status(404)
        .json({ error: _error, message: '파일이 첨부되지 않았습니다. file FormData에 파일을 첨부하여 호출해 주십시오.' });
    return;
  }

  if (_error === 'NOT_VALID_FORM_DATA') {
    _response.status(400).json({ error: _error, message: '파일이 file라는 Key 또는 FormData에 첨부되지 않았습니다' });
    return;
  }

  if (_error === 'FILE_SIZE_OVER' || (_error.message && _error.message === 'File too large')) {
    _response.status(400).json({ error: _error, message: '파일 사이즈는 2GB 이하만 가능합니다.' });
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
