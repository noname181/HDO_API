"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.UploadService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const exec = require('child_process').exec;
const moment_1 = __importDefault(require("moment"));
const convert = require('heic-convert');
class UploadService {
    constructor(config) {
        this.config = config;
        this.BUCKET_NAME = process.env.S3_BUCKET_NAME;
        this.s3 = new client_s3_1.S3({
            region: config.awsRegion,
        });
        this.client = new client_s3_1.S3Client({
            region: config.awsRegion,
        });
    }
    // TODO should method to upload images
    uploadImage(image, noFormat = false, originalName, isRandomName = true) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fileName, convertedImage } = yield this.createImageFileName(image, noFormat, originalName, isRandomName);
                const filePath = 'upload/' + fileName;
                const partSize = 1024 * 1024 * 50;
                let partNum = 0;
                // await this.client.send(
                //   new PutObjectCommand({
                //     Bucket: this.BUCKET_NAME,
                //     Key: filePath,
                //     Body: image.buffer,
                //     ContentType: image.mimetype,
                //   })
                // );
                const multipart = yield this.s3.createMultipartUpload({
                    Bucket: this.BUCKET_NAME,
                    Key: filePath,
                });
                const multipartMap = { Parts: [] };
                for (let rangeStart = 0; rangeStart < convertedImage.buffer.length; rangeStart += partSize) {
                    partNum++;
                    let end = Math.min(rangeStart + partSize, convertedImage.buffer.length);
                    const result = yield this.s3.uploadPart({
                        Body: convertedImage.buffer.slice(rangeStart, end),
                        Bucket: this.BUCKET_NAME,
                        Key: filePath,
                        PartNumber: partNum,
                        UploadId: multipart.UploadId,
                    });
                    console.log('result', partNum, result);
                    multipartMap.Parts[partNum - 1] = { ETag: result.ETag, PartNumber: Number(partNum) };
                }
                const finalResult = yield this.s3.completeMultipartUpload({
                    Bucket: this.BUCKET_NAME,
                    Key: filePath,
                    MultipartUpload: multipartMap,
                    UploadId: multipart.UploadId,
                });
                console.log('finalResult', finalResult);
                const url = 'https://' + this.BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/upload/' + fileName;
                return {
                    filePath,
                    url,
                };
            }
            catch (error) {
                console.log('vao: ', error);
            }
        });
    }
    createImageFileName(image, noFormat = false, originalName, isRandomName = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileName = '';
            const type = image.originalname.split('.')[image.originalname.split('.').length - 1];
            const now = new Date();
            const years = now.getFullYear();
            const months = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
            const day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
            const hours = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
            const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
            const seconds = now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds();
            const dateStr = `${years}${months}${day}${hours}${minutes}${seconds}`;
            const randomNumberStr = Math.floor(10000000 + Math.random() * 90000000);
            fileName =
                type == 'heic'
                    ? `${dateStr}_${isRandomName ? randomNumberStr : originalName}.png`
                    : `${dateStr}_${isRandomName ? randomNumberStr : originalName}.${type}`;
            if (type == 'heic') {
                const outputBuffer = yield convert({
                    buffer: image.buffer,
                    format: 'PNG',
                    quality: 1,
                });
                return {
                    fileName: noFormat ? originalName : fileName,
                    convertedImage: Object.assign(Object.assign({}, image), { buffer: outputBuffer }),
                };
            }
            return {
                fileName: noFormat ? originalName : fileName,
                convertedImage: image,
            };
        });
    }
    transportLogging(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = this.createLoggerFileName();
            const params = new client_s3_1.PutObjectCommand({
                Bucket: this.BUCKET_NAME,
                Key: fileName,
                Body: data,
            });
            try {
                yield this.client.send(params);
            }
            catch (error) {
                console.log('error::', error);
            }
        });
    }
    createLoggerFileName() {
        const now = new Date();
        const years = now.getFullYear();
        const months = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
        const date = now.getDate() + 1 < 10 ? `0${now.getDate()}` : now.getDate();
        return `logs/hdoev_api_total_${years}_${months}_${date}.log`;
    }
    uploadLogFile(previousDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filePath = `./logger/${previousDate}.json`;
                const fileStream = yield fs.readFileSync(filePath);
                const params = {
                    Bucket: this.BUCKET_NAME,
                    Key: `logger/${(0, moment_1.default)(previousDate, 'YYYY-MM-DD').format('YYYYMM')}/${previousDate}.json`,
                    Body: fileStream,
                };
                yield this.client.send(new client_s3_1.PutObjectCommand(params));
                yield fs.unlinkSync(filePath);
            }
            catch (error) {
                console.log('error: ', error);
            }
        });
    }
    uploadChargerDiagnostics(file, filePath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const name = fileName ? fileName : file === null || file === void 0 ? void 0 : file.originalname;
                const filePathcd = filePath + '/' + name;
                const params = {
                    Bucket: this.BUCKET_NAME,
                    Key: filePathcd,
                    Body: file.buffer,
                };
                yield this.client.send(new client_s3_1.PutObjectCommand(params));
                const url = 'https://' + this.BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/' + filePathcd;
                return {
                    filePathcd,
                    url,
                };
            }
            catch (error) {
                console.log('error: ', error);
            }
        });
    }
}
exports.UploadService = UploadService;
