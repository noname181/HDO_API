/**
 * Created by Sarc Bae on 2023-06-21.
 * Config 수정 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const qr = require('qrcode');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { configuration } = require('../../config/config');
const { USER_TYPE } = require('../../util/tokenService');
const sendUnitPrice = require('../../controllers/webAdminControllers/ocpp/sendUnitPrice');
const DEEPLINK_URL = configuration()?.deeplinkUrl;
module.exports = {
  path: ['/config/:configId'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const s3Client = new S3Client({
  region: region
});

async function service(_request, _response, next) {
  const configId = _request.params.configId;
  const body = await _request.body; // 수정될 Config 정보
  if (body.id) body.id = undefined; // body에 id가 있으면 제거
  body.updatedAt = new Date();

  try {
    // 해당 id에 대한 Config 정보 조회
    const config = await models.Config.findByPk(configId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!config) throw 'NOT_EXIST_CONFIG';
    const oldCfgVal = config.cfgVal;
    // 전달된 body로 업데이트
    const updatedConfig = await config.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 업데이트된 Config 정보 새로고침
    const reloadConfig = await config.reload({
      include: [],
      attributes: {
        exclude: ['deletedAt'],
      },
    });
 
    if(reloadConfig.divCode === 'MEMBER_DISC' && body.cfgVal != oldCfgVal){
      const allChargerAvailable = await models.sb_charger_state.findAll({
        attributes: ['chg_id'],
        where: {
          cs_charging_state: 'available',
        },
        group: ['chg_id'],
      }); 
      const arrayChargerId = allChargerAvailable.map(item => item.chg_id); 
      //send unit price to machine (connect ocpp)
      let result_ocpp = '';
      if (arrayChargerId && arrayChargerId.length > 0) {
        result_ocpp = await sendUnitPrice(arrayChargerId);
      } 
      console.log('arrayChargerId:::::', arrayChargerId)
      console.log('result_ocpp:::::', result_ocpp)
    }
    // if (reloadConfig.divCode == 'DEEPLINK') {
    //   const findall = await models.sb_charger.findAll({
    //     where: {
    //       deletedAt: null,
    //     },
    //   });

    //   const res = await Promise.all(
    //     findall.map(async (charger) => {
    //       const createdCharger = await models.sb_charger.findByPk(charger.chg_id);

    //       if (reloadConfig.cfgVal) {
    //         const deeplink = reloadConfig.cfgVal.replace(
    //           /params={}*/g,
    //           encodeURIComponent(`chg_id=${charger.chg_id}&chgs_id=${charger.chgs_id}`)
    //         );

    //         const dataQr = await generateQRCode(deeplink);

    //         await createdCharger.update({ qrcode: dataQr, deeplink });
    //       } else {
    //         throw 'NOT_EXIST_CONFIG';
    //       }
    //     })
    //   );
    // }

    // 수정된 정보 응답
    _response.json(reloadConfig);
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CONFIG') {
    _response.error.notFound(_error, '해당 ID에 대한 Config가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

async function generateQRCode(data) {
  try {
    const jsonData = data.toString(); //JSON.stringify(data);

    // const qrCodeOptions = {
    //     errorCorrectionLevel: 'H',
    //     margin: 2,
    //     width: 256,
    //     color: {
    //         dark: '#000',
    //         light: '#fff'
    //     }
    // };

    const imageBuffer = await qr.toBuffer(jsonData);
    const region = process.env.AWS_REGION;
    const bucketName = process.env.S3_BUCKET_NAME;
    const randomName = Math.floor(Math.random() * (90000 - 10000) + 10000);
    const filename =
      new Date(Date.now()).toISOString().replace(/\D/g, '').slice(0, -1) + '_' + randomName + '_' + 'qrcode.png';
    const filePath = 'upload/' + filename;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: imageBuffer,
    });
    await s3Client.send(command);
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${filePath}`;
    return url;
  } catch (error) {
    console.error('Error generating QR Code:', error);
    return null;
  }
}
