'use strict';
const { Op } = require('sequelize');
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/mobile/terms/read'],
  method: 'POST',
  checkToken: true,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { user } = _request;
  const { body } = _request;

  try {
    // 해당 약관 정보 조회
    if (!body.termIds || !body.category) throw 'NO_REQUIRED_INPUT';

    const ids = [];
    const termsAgreeData = [];
    for (let term of body.termIds) {
      if (!term.hasOwnProperty('termId')) {
        throw 'NO_REQUIRED_INPUT';
      } else {
        ids.push(term.termId);
        termsAgreeData.push({
          termId: term.termId,
          userId: user.id,
          createdAt: new Date(),
        });
      }
    }

    const { count: totalCount } = await models.Terms.findAndCountAll({
      where: {
        id: {
          [Op.in]: ids,
        },
        category: body.category,
      },
    });

    if (totalCount !== body.termIds.length) throw 'NOT_EXIST_TERMS';

    await models.TermsAgree.bulkCreate(termsAgreeData);

    // 삭제된 약관 정보 응답
    _response.json({
      status: 'success',
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

  if (_error === 'NOT_EXIST_TERMS') {
    _response.error.notFound(_error, '해당 ID에 대한 약관이 존재하지 않습니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(termIds, category)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
