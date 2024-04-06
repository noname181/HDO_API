'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;
module.exports = {
  path: ['/tool/sync-one'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const encKey = _request?.body.encKey;
  const modelName = _request?.body?.modelName;
  try {
    if (!encKey) throw "NEED_ENCKEY"
    if (encKey !== 'sksms7723!@#$RianSoft!@$R!@#$') throw "WRONG_ENCKEY"
    if (!modelName) throw "NEED_MODEL_NAME"

    // A - 작업 시작 시간 기록
    const startTime = performance.now();

    const Model = models[modelName]
    if (Model) {
      await Model
        .sync({alter:true})
        .then(() => {
          // B - DB sync 작업 수행
          const endTime = performance.now();
          const elapsedTime = ((endTime - startTime)/1000).toFixed(2);
          console.log(`remote DB ${modelName} model sync success in ${elapsedTime} seconds ( { alter:true) }`);
          _response.json({
            result: `remote DB ${modelName} model sync success in ${elapsedTime} seconds ( { alter:true })`
          });
        })
        .catch((e) => {
          _response.json({
            result: e?.stack
          });
        });
    } else {
      _response.json({
        result: "cannot find model"
      });
    }
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
  if (_error === 'NEED_MODEL_NAME') {
    _response.error.badRequest(_error, 'NEED_MODEL_NAME.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
