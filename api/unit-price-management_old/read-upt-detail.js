/**
 * Created by Inju on 2023-06-20.
 * 타임테이블 상세 조회 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/read-upt-detail'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const { upTimeTableId } = _request.query;

    const queryOptions = {
      where: {
        upTimeTableId: upTimeTableId,
      },
      order: [['baseTime', 'ASC']],
    };

    const timeTableDetails = await models.UPTimeTableDetail.findAll(queryOptions);

    _response.json({
      result: timeTableDetails,
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
