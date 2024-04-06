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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const tokenService_1 = require("../../util/tokenService");
const { USER_ROLE } = require('../../middleware/role.middleware');
const fileSize = 2000 * 1024 * 1024;
const m = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: fileSize } }).array('files', 5); // Tải lên nhiều tệp với tên trường "files" và giới hạn 5 tệp
module.exports = {
    path: ['/uploads-many'],
    method: 'post',
    checkToken: true,
    multer: m,
    roles: [tokenService_1.USER_TYPE.EXTERNAL, tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.MOBILE],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = req.files;
            if (!files || files.length === 0)
                throw 'NOT_EXIST_FILES';
            const uploadPromises = files.map((file) => {
                if (file.fieldname !== 'files')
                    throw 'NOT_VALID_FORM_DATA';
                const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + file.originalname;
                const filePath = 'upload/' + filename;
                const fileBuffer = file.buffer;
                const fileType = file.mimetype;
                if (file.size >= fileSize)
                    throw 'FILE_SIZE_OVER';
                const bucketName = process.env.S3_BUCKET_NAME;
                const accessKeyId = process.env.AWS_ACCESS_KEY;
                const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
                const region = process.env.AWS_REGION;
                const s3Client = new client_s3_1.S3Client({
                    region: region,
                });
                return s3Client
                    .send(new client_s3_1.PutObjectCommand({
                    Bucket: bucketName,
                    Key: filePath,
                    Body: fileBuffer,
                    ContentType: file.mimetype,
                }))
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    const url = 'https://' + bucketName + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/upload/' + filename;
                    return {
                        id: filePath,
                    };
                }));
            });
            const uploadedFiles = yield Promise.all(uploadPromises);
            res.json({
                status: '200',
                result: uploadedFiles,
            });
        }
        catch (e) {
            next(e);
        }
    });
}
function validator(req, res, next) {
    next();
}
function errorHandler(error, req, res, next) {
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
