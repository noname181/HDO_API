"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require('multer');
const { USER_ROLE } = require('../../middleware/role.middleware');
const tokenService_1 = require("../../util/tokenService");
const uploadService_1 = require("../../services/uploadService/uploadService");
const config_1 = require("../../config/config");
const fileSize = 2000 * 1024 * 1024; // 15MB까지 메모리 cache 허용
const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: fileSize } });
module.exports = {
    path: ['/uploads'],
    method: 'post',
    checkToken: true,
    multer: m.single('file'),
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL, tokenService_1.USER_TYPE.MOBILE],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(_request, _response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = _request.file;
            if (!file)
                throw 'NOT_EXIST_FILE';
            if (file.fieldname !== 'file')
                throw 'NOT_VALID_FORM_DATA';
            // const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + file.originalname;
            // const filePath = 'upload/' + filename;
            // if (!fileType.includes('file/')) throw 'NOT_VALID_MIME_TYPE';
            if (file.size >= fileSize)
                throw 'FILE_SIZE_OVER';
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
            const config = (0, config_1.configuration)();
            const uploadService = new uploadService_1.UploadService(config);
            const encodedFileName = _request.headers['content-disposition'];
            const decodedFileName = decodeURIComponent(encodedFileName === null || encodedFileName === void 0 ? void 0 : encodedFileName.split("filename*=UTF-8''")[1]);
            const isValid = /^[\x00-\x7F]*$/.test(file.originalname);
            let splitName = file.originalname.split('.');
            splitName.pop();
            const fileName = isValid ? splitName.join('.') : decodedFileName;
            const result = yield uploadService.uploadImage(file, false, fileName, !isValid);
            if (result) {
                const { filePath, url } = result;
                _response.json({
                    deploy: true,
                    status: '200',
                    result: {
                        id: filePath,
                    },
                });
            }
            else {
                _response.json({
                    deploy: true,
                    status: '200',
                    result: null,
                });
            }
        }
        catch (e) {
            next(e);
        }
    });
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
