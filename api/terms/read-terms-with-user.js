'use strict';
const { Op } = require('sequelize');
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
module.exports = {
  path: ['/mobile/terms'],
  method: 'get',
  checkToken: true,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { user } = _request;
  const { category } = _request.query;

  try {
    if (!category) throw 'NO_REQUIRED_INPUT';

    const { count: totalCount, rows: terms } = await models.Terms.findAndCountAll({
      where: {
        id: {
          [models.Sequelize.Op.notIn]: models.Sequelize.literal(
            `(SELECT termId FROM TermsAgrees WHERE userId = ${user.id})`
          ),
        },
        category,
      },
      attributes: { exclude: ['deletedAt'] },
      group: ['title'],
      order: [['id', 'DESC']],
    });

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

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(category)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
