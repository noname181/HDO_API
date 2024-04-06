/**
 * Created by inju on 2023-06-05.
 * Refactored by Jackie Yoon on 2023-07-25.
 * 충전기 모델 생성
 */
'use strict';
const models = require('../../models');
const Sequelize = require('sequelize');
const { generateQRCode, decodeQRCodeFromImage, uploadQRCodeToS3 } = require('../../util/Qrcode');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');
module.exports = {
  path: ['/qrCode'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const url = _request.query.url || null;
    if (!url) throw 'NO_URL';
    const result = await decodeQRCodeFromImage(url);
    const jsonObject = JSON.parse(result);
    _response.json({
      result: jsonObject,
    });
  } catch (e) {
    console.log(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}
