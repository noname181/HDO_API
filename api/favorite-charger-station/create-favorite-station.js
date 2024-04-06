/**
 * Created by inju on 2023-06-05.
 * Refactored by Jackie Yoon on 2023-07-25.
 * 충전기 모델 생성
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/favorite-station'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.createdAt = body.updatedAt = new Date();

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.createdWho = userId;
  body.updatedWho = userId;
  body.userId = userId;

  let where = {};
  if (where[Op.and] === undefined) where[Op.and] = [];
  where[Op.and].push({ userId: userId });
  if (body.type == 'other') {
    body.envChargerId =  body.favId;
    where[Op.and].push({ envChargerId: body.favId });
  } else {
    body.chargerId =  body.favId;
    where[Op.and].push({ chargerId: body.favId });
  }

  let options = {
    where: where,
  };

  const existingFavorite = await models.FavoriteChargerStation.findOne(options);
  if (existingFavorite) {
    await models.FavoriteChargerStation.destroy({
      where: {
        id: existingFavorite.id,
      },
      truncate: true,
    }); 
  }

  if(existingFavorite && !body.nickname){
    return _response.json({
      status: '200',
      result: existingFavorite,
    });
  }

  try {
    const countFavoriteStaion = await models.FavoriteChargerStation.count({
      where: {
        userId
      },
      paranoid: false,
    });
    if(!body.nickname){
      body.nickname = '즐겨찾기' + parseInt(countFavoriteStaion+1);
    }
    const favoriteStaion = await models.FavoriteChargerStation.create(body);
    _response.json({
      result: favoriteStaion,
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

  _response.error.unknown(_error.toString());
  next(_error);
}
