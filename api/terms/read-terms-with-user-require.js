'use strict';
const { Op, Sequelize } = require('sequelize');
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
module.exports = {
  path: ['/mobile/terms/require'],
  method: 'get',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { category } = _request.query;

  try {
    if (!category) throw 'NO_REQUIRED_INPUT';

    const termsParent = await models.Terms.findAll({
      where: {
        category,
        parentId: null,
      },
      attributes: { exclude: ['deletedAt'] },
      group: ['title'],
      order: [['id', 'DESC']],
    });
    let terms = [];
    await Promise.all(
      termsParent.map(async (term) => {
        const lastTerm = await models.Terms.findOne({
          where: {
            category,
            parentId: term.id,
          },
          attributes: { exclude: ['deletedAt'] },
          order: [['id', 'DESC']],
        });
        if (lastTerm) {
          terms.push(lastTerm);
        } else {
          terms.push(term);
        }
      })
    );

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
