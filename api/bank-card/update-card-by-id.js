/**
 * Created by Sarc Bae on 2023-06-13.
 * 소속 수정 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/bank-card/:cardId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const cardId = _request.params.cardId;
  const body = await _request.body; // 수정될 소속 정보
  if (body.id) body.id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id; // API 호출자의 user id
  body.updatedWho = userId;

  try {
    const card = await models.BankCard.findByPk(cardId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!card) throw 'NOT_EXIST_CARD';

    if (body.is_favorited) {
      await updateFavorited(userId);
    }

    // 전달된 body로 업데이트
    await card.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 업데이트된 소속 정보 새로고침
    const reloadCard = await card.reload({
      include: [
        // User 테이블의 경우
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
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });

    // 수정된 정보 응답
    _response.json({
      result: reloadCard,
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

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CARD') {
    _response.error.notFound(_error, '해당 ID에 대한 FAQ 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
