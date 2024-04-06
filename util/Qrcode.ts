import * as qr from 'qrcode';
import { readFileSync } from 'fs';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import jsQR from 'jsqr';


export async function generateQRCode(data: object, outputPath: string): Promise<string | null>{
    try {

        const jsonData = data.toString();//JSON.stringify(data);

        const qrCodeOptions: qr.QRCodeToFileOptions = {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 256,
            color: {
                dark: '#000',
                light: '#fff'
            }
        };
        
        await qr.toFile(outputPath, jsonData, qrCodeOptions);
        const result = await uploadQRCodeToS3(outputPath)
        return result
    } catch (error) {
        console.error('Error generating QR Code:', error);
        return null
    }
}

export async function decodeQRCodeFromImage(imagePath: string): Promise<string | null> {
    try {
        // Load the image using canvas
        const image = await loadImage(imagePath);

        // Create a canvas and draw the image on it
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height);

        // Get the image data from the canvas
        const imageData = ctx.getImageData(0, 0, image.width, image.height);

        // Decode QR code using jsqr
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode && qrCode.data) {
            return qrCode.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error decoding QR Code:', error);
        return null;
    }
}

export async function uploadQRCodeToS3(outputPath: string): Promise<string | null> {
    const qrCodeFile = fs.readFileSync(outputPath);
    const accessKeyId: any = process.env.AWS_ACCESS_KEY;
    const secretAccessKey: any = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;
    const bucketName = process.env.S3_BUCKET_NAME;
    const filename = new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + 'qrcode.png';
    const filePath = 'upload/' + filename;
    const s3Client = new S3Client({
        region: region
    });
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: qrCodeFile
    });
    try {
        await s3Client.send(command);
        const url = `https://${bucketName}.s3.${region}.amazonaws.com/${filePath}`;
        return url
    } catch (error) {
        console.error('Error uploading QR Code to S3:', error);
        return null
    }
}







