import { PutObjectCommand, S3Client, S3 } from '@aws-sdk/client-s3';
import { IConfig } from '../../config/config';
import { Readable } from 'stream';
import * as fs from 'fs';
const exec = require('child_process').exec;
import moment from 'moment';
const convert = require('heic-convert');

export class UploadService {
  private s3: S3;
  private client: S3Client;
  private BUCKET_NAME = process.env.S3_BUCKET_NAME;

  constructor(private config: IConfig) {
    this.s3 = new S3({
      region: config.awsRegion,
    });
    this.client = new S3Client({
      region: config.awsRegion,
    });
  }

  // TODO should method to upload images
  async uploadImage(image: Express.Multer.File, noFormat = false, originalName: string, isRandomName = true) {
    try {
      const { fileName, convertedImage } = await this.createImageFileName(image, noFormat, originalName, isRandomName);
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

      const multipart = await this.s3.createMultipartUpload({
        Bucket: this.BUCKET_NAME,
        Key: filePath,
      });
      const multipartMap: any = { Parts: [] };

      for (let rangeStart = 0; rangeStart < convertedImage.buffer.length; rangeStart += partSize) {
        partNum++;
        let end = Math.min(rangeStart + partSize, convertedImage.buffer.length);

        const result = await this.s3.uploadPart({
          Body: convertedImage.buffer.slice(rangeStart, end),
          Bucket: this.BUCKET_NAME,
          Key: filePath,
          PartNumber: partNum,
          UploadId: multipart.UploadId,
        });

        console.log('result', partNum, result);
        multipartMap.Parts[partNum - 1] = { ETag: result.ETag, PartNumber: Number(partNum) };
      }
      const finalResult = await this.s3.completeMultipartUpload({
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
    } catch (error) {
      console.log('vao: ', error);
    }
  }

  private async createImageFileName(
    image: Express.Multer.File,
    noFormat = false,
    originalName: string,
    isRandomName = true
  ) {
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
      const outputBuffer = await convert({
        buffer: image.buffer,
        format: 'PNG',
        quality: 1,
      });
      return {
        fileName: noFormat ? originalName : fileName,
        convertedImage: {
          ...image,
          buffer: outputBuffer,
        },
      };
    }
    return {
      fileName: noFormat ? originalName : fileName,
      convertedImage: image,
    };
  }

  async transportLogging(data: string): Promise<void> {
    const fileName = this.createLoggerFileName();
    const params = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: fileName,
      Body: data,
    });

    try {
      await this.client.send(params);
    } catch (error) {
      console.log('error::', error);
    }
  }

  private createLoggerFileName(): string {
    const now = new Date();
    const years = now.getFullYear();
    const months = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
    const date = now.getDate() + 1 < 10 ? `0${now.getDate()}` : now.getDate();

    return `logs/hdoev_api_total_${years}_${months}_${date}.log`;
  }

  async uploadLogFile(previousDate: string) {
    try {
      const filePath = `./logger/${previousDate}.json`;
      const fileStream = await fs.readFileSync(filePath);
      const params = {
        Bucket: this.BUCKET_NAME,
        Key: `logger/${moment(previousDate, 'YYYY-MM-DD').format('YYYYMM')}/${previousDate}.json`,
        Body: fileStream,
      };
      await this.client.send(new PutObjectCommand(params));
      await fs.unlinkSync(filePath);
    } catch (error) {
      console.log('error: ', error);
    }
  }

  async uploadChargerDiagnostics(file: Express.Multer.File, filePath: string, fileName: string) {
    try {
      const name = fileName ? fileName : file?.originalname;
      const filePathcd = filePath + '/' + name;

      const params = {
        Bucket: this.BUCKET_NAME,
        Key: filePathcd,
        Body: file.buffer,
      };
      await this.client.send(new PutObjectCommand(params));

      const url = 'https://' + this.BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/' + filePathcd;

      return {
        filePathcd,
        url,
      };
    } catch (error) {
      console.log('error: ', error);
    }
  }
}
