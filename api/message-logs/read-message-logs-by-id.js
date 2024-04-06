/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const Sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/messageLogs/:id',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { id } = _request.params;

  try {
    if (!id) throw 'NOT_EXIST_ID';

    const messageLog = await models.MessageLog.findOne({
      where: { id },
      include: [
        {
          model: models.UsersNew,
          as: 'csUser',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId', 'phoneNo'],
        },
        {
          model: models.sb_charger,
          as: 'charger',
          attributes: { exclude: ['deletedAt'] },
        },
      ],
    });
    if (!messageLog) throw 'NOT_EXIST';

    _response.json({
      result: messageLog,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST') {
    _response.error.notFound(_error, '소속 ID가 입력되지 않았습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_ID') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
