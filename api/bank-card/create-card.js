'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/bank-card'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const { body } = _request;
    body.createdAt = body.updatedAt = new Date();
    const userId = _request.user.id; // API 호출자의 user id
    body.createdWho = userId;
    body.updatedWho = userId;
    body.userId = userId;

    if (body.is_favorited) {
      await updateFavorited(userId);
    }

    const card = await models.BankCard.create(body);
    card.save();

    _response.json({
      result: card,
    });
  } catch (e) {
    next(e);
  }
}

async function updateFavorited(userId) {
  await models.BankCard.update(
    {
      is_favorited: false,
    },
    {
      where: {
        userId,
      },
    }
  );
}

async function validator(_request, _response, next) {
  const { cardNo } = _request.body;
  const foundCard = await models.BankCard.findOne({
    where: { cardNo: cardNo },
  });

  if (foundCard) {
    next('Card already exists');
  }

  const userId = _request.user.id || _request.user.sub || 1; // API 호출자의 user id
  const { count: totalCount } = await models.BankCard.findAndCountAll({
    where: {
      userId,
    },
  });

  if (totalCount > 5) {
    next('Card limit exceeded');
  }
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}
