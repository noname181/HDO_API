/**
 * Created by Sarc Bae on 2023-08-08.
 * 충전기 파일 업데이트 요청 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const transferNonStandardData = require('../../util/ocpp/transferNonStandardData');
const getDiagnostics = require('../../util/ocpp/getDiagnostics');
const { Op, QueryTypes, Sequelize } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { S3Client, PutObjectCommand, S3, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { configuration } = require('../../config/config');

const config = configuration();
const client = (this.s3 = new S3({
  region: config.awsRegion
}));

module.exports = {
  path: '/charger-diagnostic',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.updatedAt = new Date(); // updatedAt의 default 값을 sequelize에서 데이터 생성시 호출하지 못하여 수동으로 추가

  // pk는 자동생성이므로, body에 pk가 전달되는 경우 제거
  if (body.id) body.id = undefined;

  try {
    // 필수값 정의(자동으로 만들어지는 pk 제외)
    if (!body.chargers || !Array.isArray(body.chargers) || body.chargers.length == 0) throw 'NO_REQUIRED_INPUT';

    // 존재하는지 검증
    for (let i of body.chargers) {
      // 이미 존재하는 충전기들 인지 확인
      const checkExist = await models.sb_charger.findOne({
        where: { chg_id: i },
      });
      if (!checkExist) throw 'CHARGER_NOT_EXIST';
    }

    // TODO div(qr,ad,tm,fw) 분기하여 업데이트 요청(OCPP) 연결 필요

    // TODO 성공 완료 시 DB상의 charger 칼럼 업데이트

    // TODO 성공 결과 return - 임시
    const result = body?.chargers;
    const startTime = body?.startTime;
    const stopTime = body?.stopTime;
    let isRequestSuccess = false;
    const userId = _request.user.id || _request.user.sub; // API 호출자의 user id

    for (let i = 0; i < result.length; i++) {
      const ocppResult = await callOCPP(result[i], userId, startTime, stopTime);

      if (ocppResult?.result && ocppResult?.result.toString() === '000') {
        await models.sb_charger.update(
          { cdTransDate: new Date() },
          {
            where: {
              chg_id: result[i],
            },
          }
        );

        isRequestSuccess = true;
      } else {
        isRequestSuccess = false;
      }
    }

    if (isRequestSuccess == false) {
      throw 'CONNECT_OCPP_FAILED';
    }

    // 조회된 결과 반환
    _response.json({
      result: result,
      test: 'ok',
    });
  } catch (e) {
    next(e);
  }
}

async function callOCPP(item, userId, startTime, stopTime) {
  try {
    // retries -> 1
    // retryInterval ->10
    // startTime-> now
    // stopTime->1h later
    //const bucketName = process.env.S3_BUCKET_NAME;
    const datetime = new Date(Date.now()).toISOString().split('T')[0];
    // const filePath = 'upload_diagnostic/' + item + '/' + filename + '/' + 'test.txt';
    // const filePath2 = 'upload_diagnostic/' + item + '/' + filename + '/';
    //const buffer = Buffer.from("text ocpp", 'utf-8');

    //const region = process.env.AWS_REGION;
    const config = configuration();
    
    const now = new Date();
    const years = now.getFullYear();
    const months = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
    const day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
    const hours = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
    const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
    const seconds = now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds();

    const dateStr = `${years}${months}${day}${hours}${minutes}${seconds}`;

    const randomNumberStr = Math.floor(10000000 + Math.random() * 90000000);
    const url = `${config.apiServerUrl}/upload-diagnostics/upload_diagnostic/${item}/${datetime}/${dateStr}_${randomNumberStr}`;

    //const url2 = `https://${bucketName}.s3.${region}.amazonaws.com/${filePath2}`;

    // const params = {
    //   Bucket: bucketName,
    //   Key: filePath2,
    //   Body: buffer,
    // };
    // await client.send(new PutObjectCommand(params));

    const retries = 1;
    const retryInterval = 10;

    // const startTime = new Date();
    // const stopTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const start = startTime ? startTime : new Date().toISOString().slice(0, 16).split('T').join(' ');
    const stop = stopTime ? stopTime : new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(0, 16).split('T').join(' ');

    const location = url;
    // console.log({
    //     cid: item,
    //     location: url,
    //     retries: retries,
    //     retryInterval: retryInterval,
    //     startTime: startTime,
    //     stopTime: stopTime,
    // })
    const tranfer = await getDiagnostics({
      cid: item,
      location: location,
      retries: retries,
      retryInterval: retryInterval,
      // startTime: startTime.toISOString().slice(0, 16).split('T').join(' '),
      // stopTime: stopTime.toISOString().slice(0, 16).split('T').join(' '),
      startTime: start,
      stopTime: stop,
    });

    if (tranfer?.result && tranfer?.result.toString() === '000') {
      await models.sb_charger_ocpp_log.create({
        chg_id: item,
        file_id: null,
        division: 'CD',
        version: '',
        fileURL: location,
        newestVersion: 1,
        updatedAt: new Date(),
        createdWho: userId,
        updatedWho: userId,
      });
    }

    return tranfer;
  } catch (e) {
    console.log(e);
    return 'AXIOS_ERROR';
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'CHARGER_NOT_EXIST') {
    _response.error.badRequest(
      _error,
      '업데이트에 실패하였습니다.(사유: 입력된 id 중 해당하는 충전기가 없는 경우 혹은 업데이트 할 수 없는 상황)'
    );
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '등록할 충전기를 선택해주세요');
    return;
  }

  if (_error === 'NO_REQUIRED_FILE') {
    _response.error.notFound(_error, '전송할 파일을 선택해주세요');
    return;
  }

  if (_error === 'CONNECT_OCPP_FAILED') {
    _response.error.notFound(_error, '전송이 실패하였습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
