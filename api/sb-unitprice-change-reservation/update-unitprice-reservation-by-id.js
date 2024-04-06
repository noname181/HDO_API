/**
 * Created by Sarc Bae on 2023-06-13.
 * 소속 수정 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/unit-price-reservation/:reservationId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const reservationId = _request.params.reservationId;
  const body = await _request.body; // 수정될 소속 정보
  if (body.id) body.id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id; // API 호출자의 user id
  body.updatedWho = userId;
  body.updatedAt = new Date();

  try {
    const newInstance = await models.sb_unitprice_change_reservation.findByPk(reservationId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    await newInstance.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    const result = await newInstance.reload({
      include: [
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
      ]
    });

    _response.json({
      result: result,
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

  if (_error === 'NOT_EXIST_BOOKING') {
    _response.error.notFound(_error, '해당 ID에 대한 FAQ 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
