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
exports.uploadQRCodeToS3 = exports.decodeQRCodeFromImage = exports.generateQRCode = void 0;
const qr = __importStar(require("qrcode"));
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const canvas_1 = require("canvas");
const jsqr_1 = __importDefault(require("jsqr"));
function generateQRCode(data, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jsonData = data.toString(); //JSON.stringify(data);
            const qrCodeOptions = {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: 256,
                color: {
                    dark: '#000',
                    light: '#fff'
                }
            };
            yield qr.toFile(outputPath, jsonData, qrCodeOptions);
            const result = yield uploadQRCodeToS3(outputPath);
            return result;
        }
        catch (error) {
            console.error('Error generating QR Code:', error);
            return null;
        }
    });
}
exports.generateQRCode = generateQRCode;
function decodeQRCodeFromImage(imagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Load the image using canvas
            const image = yield (0, canvas_1.loadImage)(imagePath);
            // Create a canvas and draw the image on it
            const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, image.width, image.height);
            // Get the image data from the canvas
            const imageData = ctx.getImageData(0, 0, image.width, image.height);
            // Decode QR code using jsqr
            const qrCode = (0, jsqr_1.default)(imageData.data, imageData.width, imageData.height);
            if (qrCode && qrCode.data) {
                return qrCode.data;
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error('Error decoding QR Code:', error);
            return null;
        }
    });
}
exports.decodeQRCodeFromImage = decodeQRCodeFromImage;
function uploadQRCodeToS3(outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const qrCodeFile = fs.readFileSync(outputPath);
        const accessKeyId = process.env.AWS_ACCESS_KEY;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION;
        const bucketName = process.env.S3_BUCKET_NAME;
        const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + 'qrcode.png';
        const filePath = 'upload/' + filename;
        const s3Client = new client_s3_1.S3Client({
            region: region
        });
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            Body: qrCodeFile
        });
        try {
            yield s3Client.send(command);
            const url = `https://${bucketName}.s3.${region}.amazonaws.com/${filePath}`;
            return url;
        }
        catch (error) {
            console.error('Error uploading QR Code to S3:', error);
            return null;
        }
    });
}
exports.uploadQRCodeToS3 = uploadQRCodeToS3;
