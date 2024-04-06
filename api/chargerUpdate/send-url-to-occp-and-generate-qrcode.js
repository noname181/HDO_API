/**
 * Created by Sarc Bae on 2023-08-08.
 * 충전기 파일 업데이트 요청 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const transferNonStandardData = require('../../util/ocpp/transferNonStandardData');
const { generateQRCode } = require('../../util/Qrcode');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/charger/generate-app-qrcode',
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
    const charger_id = body.charger_id;
    // 이미 존재하는 충전기들 인지 확인
    const checkExist = await models.sb_charger.findOne({
      where: { chg_id: charger_id },
    });
    if (!checkExist) throw 'CHARGER_NOT_EXIST';

    // TODO 성공 완료 시 DB상의 charger 칼럼 업데이트

    // TODO 성공 결과 return - 임시
    const deeplink = body.deeplink;
    // let isRequestSuccess = false;

    // const ocppResult = await callOCPP(charger_id, deeplink);
    const dataQr = await generateQRCode(deeplink, 'qrCode.png');
    const updatedCharger = await models.sb_charger.update(
      { qrcode: dataQr },
      {
        where: {
          chg_id: charger_id,
        },
      }
    );

    // if (ocppResult['result'] === '000') {

    //   isRequestSuccess = true;
    // } else {
    //   isRequestSuccess = false;
    // }

    // if (isRequestSuccess == false) {
    //   throw 'CONNECT_OCPP_FAILED';
    // }

    // 조회된 결과 반환
    _response.json({
      result: updatedCharger,
    });
  } catch (e) {
    next(e);
  }
}

async function callOCPP(chg_id, url) {
  try {
    const tranfer = await transferNonStandardData({
      cid: chg_id,
      vendorId: 1,
      messageId: 'QRImage LINK URL',
      data: {
        url,
      },
    });

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
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(div, chargers<Array>)');
    return;
  }

  if (_error === 'CONNECT_OCPP_FAILED') {
    _response.error.notFound(_error, '전송이 실패하였습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
