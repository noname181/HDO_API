/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const { S3Client, PutObjectCommand, S3, ListObjectsCommand, listObjects, ListObjectsV2Command  } = require('@aws-sdk/client-s3');
const { configuration } = require('../../config/config');
const Op = sequelize.Op;
const config = configuration()
const client = this.s3 = new S3({
    region: config.awsRegion
  });

module.exports = {
  path: ['/charger-ocpp-log'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    // 페이징 정보
    const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
    const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
    const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
    const chg_id = _request.query.chg_id || null;
    const division = _request.query.division || null;
    const where = {};
    if (chg_id) {
      where.chg_id = chg_id;
    }

    if(division){
        where.division = division;
    }

    let options = {
      where: where,
      include: [
        // User 테이블의 경우
        {
          model: models.UsersNew,
          as: 'createdBy',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
        },
        {
          model: models.UsersNew,
          as: 'updatedBy',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
        },
        {
          model: models.FileToCharger,
          as: 'fileOCPPLogs',
          attributes: ['id', 'newestVersion'],
        },
        {
          model: models.sb_charger,
          as: 'chargerOCPPLogs',
          attributes:{ exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
          include: [
            {
              model: models.ChargerModel,
              as: 'chargerModel',
              attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
              // include: [
              //   {
              //     model: models.ChargerModelFW,
              //     as: 'firmwares',
              //     where: {
              //       isLast: true,
              //     },
              //     attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
              //   },
              // ],
            }
          ]
        },  
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
      order: [['col_id', orderByQueryParam]],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
    };
    
    
    
    let file_data = [];
    
    if(division != 'CD'){
      file_data = [];
    }else{
      
        const bucketName = process.env.S3_BUCKET_NAME;
        const params = {
          Bucket: bucketName,
          MaxKeys: 1000,
          // Delimiter: 'upload_diagnostic/573/2023-12-08',
          // Prefix: 'https://hdoev-asset-dev.s3.ap-northeast-2.amazonaws.com/upload_diagnostic/573/2023-12-08/',
          Prefix: 'upload_diagnostic/' + chg_id + '/',
        };
        
        const data = await client.send(new ListObjectsV2Command(params));
        //console.log('data::', data)
        const region = process.env.AWS_REGION;
        const url = `https://${bucketName}.s3.${region}.amazonaws.com/`;
          if(data['Contents']){
            for (let index = 0; index < data['Contents'].length; index++) {
              if(data['Contents'][index]['Size'] > 0){
                file_data.push({name: data['Contents'][index]['Key'].split("/").pop() , url_download: data['Contents'][index]['Key'] ,url: url + data['Contents'][index]['Key'], date: new Date(data['Contents'][index]['LastModified']).toISOString().replace('Z', '').replace('T', ' ')});   
              }
            }
          }
  
    }
    
    const { count: totalCount, rows: chargerOCPP_ } = await models.sb_charger_ocpp_log.findAndCountAll(options);
    const chargerOCPP = chargerOCPP_.map((value) => {
      return {
        ...value.dataValues,
        totalCount,
      };
    });
    _response.json({
      totalCount: totalCount,
      result: chargerOCPP,
      totalCountfile: file_data ? file_data.length : 0,
      file: file_data.reverse(),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
