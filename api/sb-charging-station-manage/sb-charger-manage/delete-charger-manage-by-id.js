/**
 * Created by Sarc Bae on 2023-06-07.
 * 충전기 삭제 API
 */
'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: '/chargers-manage/:chg_id',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chg_id = _request.params.chg_id;
  const force = _request.query.force === 'true'; // Query파라메터로 전달 된 강제 삭제 여부(강제삭제 : row 자체를 삭제. 강제삭제가 아닌경우가 default. 강제삭제가 아닌 경우 deletedAt에 timestamp가 생기면서 조회시 무시됨)

  try {
    // 해당 충전기 정보 조회
    const charger = await models.sb_charger.findByPk(chg_id);
    if (!charger) throw 'NOT_EXIST_CHARGER';

    await models.sb_charger.update(
      {
        chg_alias: models.sequelize.literal("CONCAT('del_', chg_alias)"),
        mall_id: models.sequelize.literal("CONCAT('del_', mall_id)"),
        chg_charger_id: models.sequelize.literal("CONCAT('del_', chg_charger_id)"),
      },
      {
        where: {
          chg_id,
        },
      },
      { transaction: transaction },
      { force: false }
    );

    // 해당 충전기 정보 삭제
    const deletedCharger = await charger.destroy({
      include: [
        { model: models.sb_charger, as: 'chargers', attributes: { exclude: ['deletedAt'] } },
        { model: models.Org, as: 'org', attributes: { exclude: ['deletedAt'] }, required: false },
      ],
      attributes: {
        exclude: ['deletedAt'],
      },
      force: force,
    });

    //Find and update unit price
    const foundUnitPrice = await models.sb_charger.findOne({
      where: {
        upSetId: charger.upSetId,
      },
    });

    if (!foundUnitPrice) {
      await models.UnitPriceSet.update(
        { isUsed: false },
        {
          where: {
            id: charger.upSetId,
          },
        }
      );
    }

    // 삭제된 충전기 정보 응답
    _response.json({
      result: deletedCharger,
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

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '해당 ID에 대한 충전기가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
