/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
'use strict';
const { cardNoMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/bank-card/user'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(req, res, next) {
  try {
    const { count, rows: cards } = await models.BankCard.findAndCountAll({ where: { userId: req.user.id } });
    const results =
      cards?.map((card) => ({
        id: card.id,
        card_number: cardNoMask(card.cardNo),
        expiration_date: new Date(0),
        birthday: new Date(0),
        card_brand: card.cardBrand,
        card_issuer: card.cardIssuer,
        password: '**',
        is_favorited: card.is_favorited,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      })) || [];

    res.json({
      totalCount: count,
      result: results,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

function validator(_request, _response, next) {
  const { userId } = _request.params;
  if (!userId) next('Bad Request');
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
