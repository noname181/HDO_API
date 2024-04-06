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
/**
 * Migrated by Sarc Bae on 2023-08-08
 * 파일 추가 API
 */
const client_s3_1 = require("@aws-sdk/client-s3");
const multer = require('multer');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const stream_1 = require("stream"); // parameter type 명시를 위해 추가
const tokenService_1 = require("../../util/tokenService");
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
    roles: [tokenService_1.USER_TYPE.EXTERNAL, tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.MOBILE],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(_request, _response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = _request.files;
            if (!files.file && (!files.files || files.files.length === 0))
                throw 'NOT_EXIST_FILES';
            let singleFileData = [];
            if (files.file) {
                const singleFile = files.file[0];
                singleFileData = yield uploadFiles(singleFile, 'file');
            }
            const multipleFiles = files.files ? files.files : [];
            let multipleFilesData = [];
            if (multipleFiles || multipleFiles.length !== 0) {
                multipleFilesData = yield Promise.all(multipleFiles.map((file) => uploadFiles(file, 'files')));
            }
            _response.status(HTTP_STATUS_CODE.OK).json({
                file: singleFileData,
                files: multipleFilesData,
            });
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
function uploadFiles(file, fieldname) {
    return __awaiter(this, void 0, void 0, function* () {
        if (file.fieldname !== fieldname)
            throw 'NOT_VALID_FORM_DATA';
        const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + file.originalname;
        const filePath = 'upload/' + filename;
        const fileBuffer = yield stream_1.Readable.from(file.buffer).read();
        const fileType = file.mimetype;
        // if (!fileType.includes('file/')) throw 'NOT_VALID_MIME_TYPE';
        if (file.size >= fileSize)
            throw 'FILE_SIZE_OVER';
        const bucketName = process.env.S3_BUCKET_NAME;
        // AWS 인증정보 로드
        const accessKeyId = process.env.AWS_ACCESS_KEY;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION;
        // S3 버킷정보 구성
        const s3Client = new client_s3_1.S3Client({
            region: region
        });
        // S3 버킷에 파일 전송
        yield s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            Body: fileBuffer,
            // ContentType: 'image/png'
            ContentType: file.mimetype,
        }));
        const url = 'https://' + bucketName + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/upload/' + filename;
        return {
            id: filename,
            url: url,
        };
    });
}
