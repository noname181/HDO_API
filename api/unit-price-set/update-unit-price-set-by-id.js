'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { Op } = require('sequelize');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const sendUnitPrice = require('../../controllers/webAdminControllers/ocpp/sendUnitPrice');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/unit-price-set/:unitPriceId',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const unitPriceId = _request.params.unitPriceId;
  const body = await _request.body; // 수정될 소속 정보
  if (body.id) body.id = undefined; // body에 id가 있으면 제거
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id\
  body.updatedWho = userId;

  try {
    const unitPrice = await models.UnitPriceSet.findByPk(unitPriceId, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!unitPrice) throw 'NOT_EXIST_UNIT_PRICE';

    //Check name already exists
    const foundUnitPriceByName = await findUnitPriceByName(unitPriceId, body.unitPriceSetName);
    if (foundUnitPriceByName) throw 'DUPLICATE';

    // 전달된 body로 업데이트
    await unitPrice.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    // 업데이트된 소속 정보 새로고침
    const reloadunitPrice = await unitPrice.reload({
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

    //send unit price to machine (connect ocpp)
    const chargersUsingUnitPriceSet = await models.sb_charger.findAll({
      attributes: ['chg_id'],
      where: {
        usePreset: 'Y',
        upSetId: unitPriceId,
      },
    });

    let array_chg_id = [];   
    let existChargerWasNotUpdatePrice = false;
    //make update price when charger state is 'available'
    await Promise.all(chargersUsingUnitPriceSet.map(async (charger) => { 
      const { count: totalCountChannel, rows: allChannel } = await models.sb_charger_state.findAndCountAll({
        where: {
          chg_id: charger.chg_id,
        }, 
      });

      const countAllChannelAvailable = allChannel.filter(channel => channel.cs_charging_state === 'available').length;

      if(totalCountChannel > 0 && countAllChannelAvailable > 0 && totalCountChannel === countAllChannelAvailable){
        array_chg_id.push(charger.chg_id);
      } else {
        existChargerWasNotUpdatePrice = true;
      }
    }));
    
    // for send updated info. I changed position to below the transation.
    if (array_chg_id && array_chg_id.length > 0) {
      await sendUnitPrice(array_chg_id);
    }  

    if(existChargerWasNotUpdatePrice){
      throw 'CHARGER_IS_USING_CANNOT_UPDATE';
    }

    // 수정된 정보 응답
    _response.json({  
      result: reloadunitPrice,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

async function findUnitPriceByName(id, name) {
  return await models.UnitPriceSet.findOne({
    where: {
      [Op.and]: [
        {
          unitPriceSetName: name,
        },
        {
          id: {
            [Op.ne]: id,
          },
        },
      ],
    },
  });
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_UNIT_PRICE') {
    _response.error.notFound(_error, '해당 ID에 대한 UNIT PRICE 존재하지 않습니다.');
    return;
  }

  if (_error === 'BAD_REQUEST') {
    _response.error.badRequest(_error, 'Bad Request');
    return;
  }

  if (_error === 'DUPLICATE') {
    _response.error.badRequest(_error, '동일한 이름이 존재합니다.');
    return;
  }

  if (_error === 'CHARGER_IS_USING_CANNOT_UPDATE') {
    _response.error.badRequest(_error, '단가를 전송받지 못한 충전기가 있습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
