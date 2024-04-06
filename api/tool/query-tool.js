'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;
module.exports = {
  path: ['/tool/query'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const encKey = _request?.body.encKey;
  const query = _request?.body.query;
  try {
    if (!encKey) throw "NEED_ENCKEY"
    if (!query) throw "NEED_QUERY"
    if (encKey !== 'sksms7723!@#$RianSoft!@$R!@#$') throw "WRONG_ENCKEY"
    if (!query.toLowerCase().startsWith("select")) throw "ONLY_SELECT_POSIIBLE"
    const resultArr = query.match(/;/g)?.filter(v => v !== '')
    if (!resultArr || resultArr.length === 0) {
      throw "SEMI_COLON_NEEDED"
    } else if (resultArr?.length > 1) {
      throw "ONLY_ONE_SEMI_COLON_ALLOWED"
    }
    const result = await models.sequelize.query(query,
    {
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    });
    _response.json({
      result: result
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
    _response.error.notFound(_error, 'NEED_ENCKEY.');
    return;
  }
  if (_error === 'NEED_QUERY') {
    _response.error.notFound(_error, 'NEED_QUERY.');
    return;
  }
  if (_error === 'WRONG_ENCKEY') {
    _response.error.notFound(_error, 'WRONG_ENCKEY.');
    return;
  }
  if (_error === 'ONLY_SELECT_POSIIBLE') {
    _response.error.notFound(_error, 'ONLY_SELECT_POSIIBLE.');
    return;
  }
  if (_error === 'ONLY_ONE_SEMI_COLON_ALLOWED') {
    _response.error.notFound(_error, 'ONLY_ONE_SEMI_COLON_ALLOWED.');
    return;
  }
  if (_error === 'SEMI_COLON_NEEDED') {
    _response.error.notFound(_error, 'SEMI_COLON_NEEDED.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
