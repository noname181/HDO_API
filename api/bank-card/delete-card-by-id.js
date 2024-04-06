'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/bank-card/:cardId',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { cardId } = _request.params;

  try {
    const card = await models.BankCard.findByPk(cardId);
    if (!card) throw 'NOT_EXIST_CARD';

    const deletedCard = await card.destroy({ force: false });

    _response.json({
      result: deletedCard,
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

  if (_error === 'NOT_EXIST_CARD') {
    _response.error.notFound(_error, '해당 ID에 대한 소속이 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
