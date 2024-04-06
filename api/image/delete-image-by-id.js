"use strict";
/**
 * Created by Jackie Yoon on 2023-06-05.
 * 이미지 아이디로 삭제 API
 */
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
const client_s3_1 = require("@aws-sdk/client-s3");
const tokenService_1 = require("../../util/tokenService");
const { USER_ROLE } = require('../../middleware/role.middleware');
module.exports = {
    path: '/images/:imageId',
    method: 'delete',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.EXTERNAL, tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.MOBILE],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(_request, _response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageId = _request.params.imageId; // Path파라메터로 전달된 imageId
        const bucketName = process.env.S3_BUCKET_NAME;
        // AWS 인증정보 로드
        const accessKeyId = process.env.AWS_ACCESS_KEY;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION;
        // S3 버킷정보 구성
        const s3Client = new client_s3_1.S3Client({
            region: region
        });
        const filePath = `upload/${imageId}`;
        const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`;
        yield s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: filePath,
        }));
        _response.json({
            status: '200',
            result: {
                imageId: imageId,
                url: url,
            },
        });
    });
}
function validator(_request, _response, next) {
    next();
}
function errorHandler(_error, _request, _response, next) {
    console.error(_error);
    if (_error.code === 404 && _error.message === 'Not Found') {
        _response.error.notFound(_error, '해당 imageId에 대한 이미지를 찾을 수 없습니다.');
        return;
    }
    _response.error.unknown(_error.toString());
    next(_error);
}
