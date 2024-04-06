/**
 * Created by inju on 2023-06-05.
 * Modified by Jackie Yoon on 2023-07-25.
 * 충전기 모델 삭제
 */
'use strict';
const { USER_ROLE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: ['/charger-manage/delete-batch'],
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargerManageIds = _request.body.chargerManageIds;
  const transaction = await models.sequelize.transaction();

  try {
    if (!chargerManageIds || !Array.isArray(chargerManageIds) || chargerManageIds.length == 0)
      throw 'NO_REQUIRED_INPUT';

    for (let id of chargerManageIds) {
      // const charger = await models.sb_charger.findByPk(id);
      // if (charger.chg_use_yn === 'Y') {
      //   throw 'CHARGER_IN_USE';
      // }

      // const booking = await models.Booking.findOne({
      //   where: {
      //     chg_id: id,
      //     b_status: { [Op.in]: ['reserved', 'selected', 'charging'] },
      //   },
      // });

      // if (booking) throw 'CHARGER_IN_USE';

      const cs_charging_state = await models.sb_charger_state.findOne({
        where: {
          [Op.and]: [{ chg_id: id }, { cs_charging_state: { [Op.in]: ['preparing', 'charging', 'finishing'] } }],
        },
        attributes: ['cs_charging_state'],
      });

      if (cs_charging_state) throw 'CHARGER_IN_USE';
    }

    await models.sb_charger.update(
      {
        chg_alias: models.sequelize.literal("CONCAT('del_', chg_alias)"),
        mall_id: models.sequelize.literal("CONCAT('del_', mall_id)"),
        chg_charger_id: models.sequelize.literal("CONCAT('del_', chg_charger_id)"),
        deletedAt: new Date(),
      },
      {
        where: {
          chg_id: {
            [Op.in]: chargerManageIds,
          },
        },
      },
      { transaction: transaction },
      { force: false }
    );

    await models.sb_charger_state.update(
      { deletedAt: new Date() },
      {
        where: {
          chg_id: {
            [Op.in]: chargerManageIds,
          },
        },
      },
      { transaction: transaction },
      { force: false }
    );

    await transaction.commit();

    // 삭제된 충전기 모델 정보 응답
    _response.json({
      status: '200',
      message: 'Success',
    });
  } catch (e) {
    await transaction.rollback();
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(chargerManageIds)');
    return;
  }

  if (_error === 'CHARGER_IN_USE') {
    _response.error.notFound(_error, '사용중일 때는 충전기를 삭제할 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
