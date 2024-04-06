'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;
module.exports = {
  path: ['/tool/sync'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const encKey = _request?.body.encKey;
  const option = _request?.body?.option ?? 'default';
  try {
    if (!encKey) throw "NEED_ENCKEY"
    if (encKey !== 'sksms7723!@#$RianSoft!@$R!@#$') throw "WRONG_ENCKEY"

    if (option.toLowerCase() !== "default" && option.toLowerCase() !== "alter") {
      throw "WRONG_OPTION"
    }
    let optionParam = null
    if (option.toLowerCase() === "alter") {
      optionParam = { alter : true }
    }

    // A - 작업 시작 시간 기록
    const startTime = performance.now();

    await models.sequelize
      .sync(optionParam)
      .then(() => {
        // B - DB sync 작업 수행
        const endTime = performance.now();
        const elapsedTime = ((endTime - startTime)/1000).toFixed(2);
        console.log(`remote DB sync success in ${elapsedTime} seconds`);
        _response.json({
          result: `remote DB sync success in ${elapsedTime} seconds`
        });
      })
      .catch((e) => {
        _response.json({
          result: e?.stack
        });
      });
  } catch (e) {
    next(e)
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);
  if (_error === 'NEED_ENCKEY') {
    _response.error.badRequest(_error, 'NEED_ENCKEY.');
    return;
  }
  if (_error === 'WRONG_ENCKEY') {
    _response.error.badRequest(_error, 'WRONG_ENCKEY.');
    return;
  }
  if (_error === 'WRONG_OPTION') {
    _response.error.badRequest(_error, 'ONLY default / alter possible.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
