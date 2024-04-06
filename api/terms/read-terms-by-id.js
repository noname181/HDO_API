'use strict';
const { Op } = require('sequelize');
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/terms/:termsId'],
  method: 'get',
  checkToken: false,
  roles: [],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const termsId = _request.params.termsId;

  // Querying 옵션1 - 언어 전체 조회
  const option = {
    include: [
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
    exclude: ['createdWho', 'updatedWho', 'deletedAt'],
  };

  try {
    if (!termsId) throw 'NO_TERMS_ID';

    const terms = await models.Terms.findByPk(termsId, option);
    if (!terms) throw 'NOT_EXIST_TERM';

    // if (terms.dataValues.parentId) {
    terms.dataValues.childs =
      (await models.Terms.findAll({
        where: {
          [Op.or]: [{ parentId: terms.dataValues.id }, { id: termsId }],
        },
      })) || [];
    // }

    _response.json({
      result: terms,
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

  if (_error === 'NO_TERMS_ID') {
    _response.error.notFound(_error, '약관 ID가 입력되지 않았습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_TERM') {
    _response.error.notFound(_error, '해당 ID에 대한 약관 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
