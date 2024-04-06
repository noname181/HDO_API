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
const tokenService_1 = require("../../util/tokenService");
const { USER_ROLE } = require('../../middleware/role.middleware');
const axios = require('axios');
module.exports = {
    path: '/images/:imageId',
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.EXTERNAL, tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.MOBILE],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(_request, _response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const imageId = _request.params.imageId; // Path파라메터로 전달된 imageId
            const bucketName = process.env.S3_BUCKET_NAME;
            const filePath = `upload/${imageId}`;
            const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`;
            const imageFile = yield axios({
                url: url,
                method: 'GET',
                responseType: 'arraybuffer',
            });
            _response
                .status(200)
                .set('Content-Type', imageFile.headers['content-type'])
                .set('Content-Length', imageFile.headers['content-length'])
                .set('Cache-Control', 'public, max-age=2592000')
                .end(imageFile.data, 'binary');
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
    if (_error === 'NOT_EXIST_IMAGE_FILE') {
        _response.error.notFound(_error, '해당 이미지 파일이 존재하지 않습니다.');
        return;
    }
    _response.error.unknown(_error.toString());
    next(_error);
}
