/**
 * Created by Sarc Bae on 2023-08-08.
 * 충전기 파일 업데이트 요청 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const transferNonStandardData = require('../../util/ocpp/transferNonStandardData');
const updateFirmware = require('../../util/ocpp/updateFirmware');
const { Op, QueryTypes, Sequelize } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/charger-update',
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
    if (!body.div || !body.chargers || !Array.isArray(body.chargers) || body.chargers.length == 0)
      throw 'NO_REQUIRED_INPUT';
    body.div = body.div.toUpperCase();

    if (!body.file_id){
      throw 'NO_REQUIRED_FILE';
    }
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
    const div = body.div;
    const result = body.chargers;
    const file_id = body.file_id;
    const url = body.url;
    const version = body.version;
    const newestVersion = body.newestVersion;
    let isRequestSuccess = false;
    const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
    

    for (let i = 0; i < result.length; i++) {
      const ocppResult = await callOCPP(div, result[i], file_id, url);

     if (ocppResult?.result && ocppResult?.result.toString() === '000') {
        await models.sb_charger.update(
          div == 'QR'
            ? { qrTransDate: new Date() }
            : div == 'AD'
            ? { adTransDate: new Date() }
            : div == 'TM'
            ? { tmTransDate: new Date() }
            : div == 'FW'
            ? { fwTransDate: new Date() }
            : {},
          {
            where: {
              chg_id: result[i],
            },
          }
        );

        await models.sb_charger_ocpp_log.create(
          {
            chg_id: result[i],
            file_id: file_id,
            division: div,
            version: version,
            fileURL: url,
            newestVersion: newestVersion,
            updatedAt: new Date(),
            createdWho: userId,
            updatedWho: userId,
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
      div: div,
      result: result,
      test: 'ok',
    });
  } catch (e) {
    next(e);
  }
}

async function callOCPP(div, item, file_id, url) {
  try {
    let data = {};
    let messageId = '';

    // sb_charger_state 조회
    const charger_state = await models.sb_charger_state.findOne({
      where: { chg_id: item, cs_channel: 1 },
    });
    const vendorId = charger_state?.cs_vendor ?? '';

    if (div != 'FW') {
      const charger = await models.sb_charger.findByPk(item);

      if (div == 'QR') {
        messageId = 'QRImage';
        data.url = charger.deeplink ? charger.deeplink : '';
      } else if (div == 'TM') {
        messageId = 'CardPolicy';

        // const file = await models.FileToCharger.findOne({
        //   where: { id: file_id,division: 'TM' },
        // });

        data.url = url ? url : '';
      } else if (div == 'AD') {
        messageId = 'AdvertisementList';

        const file = await models.FileToCharger.findOne({
          where: { id: file_id,division: 'AD' },
        });

        data.adURL = url ? url : '';
        data.version = file.version ? file.version : '';
        // data = {
        //   adURL: file.fileURL.toString(),
        //   version: file.version.toString(),
        // };
      }
      console.log(data);
      const tranfer = await transferNonStandardData({
        cid: item,
        vendorId: vendorId,
        messageId: messageId,
        data: JSON.stringify(data),
      });

      return tranfer;
    } else {
      const query_FW = `SELECT FW.fwfileurl AS FileURL 
        FROM sb_chargers C 
        LEFT JOIN ChargerModelFWs FW ON FW.modelId = C.chargerModelId AND FW.isLast = TRUE 
        WHERE C.chg_id = ${item} AND C.deletedAt IS NULL AND FW.deletedAt IS NULL `;

      const result_FW = await models.sequelize.query(query_FW, {
        type: Sequelize.QueryTypes.SELECT,
      });

      const tranfer = await updateFirmware({ cid: item, location: result_FW[0]['FileURL'] });

      return tranfer;
    }
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
