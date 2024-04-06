'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { Op } = require('sequelize');
const resetCharger = require('../../../util/ocpp/reset');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: ['/reset-charger/:chg_id'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargingStationId = _request.params.chargingStationId;
  const chg_id = _request.params.chg_id;

  const body = await _request.body; // 수정될 충전기 정보
  if (body.chg_id) body.chg_id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;
  let ocpp_return = '';

  try {
    // if (body.chg_charger_id) {
    //   const existCheck = await models.sb_charger.findOne({
    //     where: {
    //       chg_id: { [Op.ne]: chg_id },
    //       chg_charger_id: body.chg_charger_id,
    //     },
    //     transaction: transaction,
    //     attributes: {
    //       exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    //     },
    //   });
    //   if (existCheck) throw 'CHARGER_ID_IS_EXIST';
    // }

    // 해당 chg_id에 대한 충전기 정보 조회
    const charger = await models.sb_charger.findByPk(chg_id, {
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });
    if (!charger) throw 'NOT_EXIST_CHARGER';

    const type = body.type;
    if (!type) {
      throw 'EMPTY_TYPE';
    }
    if (type != 'Hard' && type != 'Soft') {
      throw 'WRONG_TYPE';
    }
    const chargerIsOffline = await models.sb_charger_state.count({
      where: {
        chg_id: chg_id,
        cs_charging_state: 'offline',
      },
    });

    if (chargerIsOffline) {
      throw 'CHARGER_IS_OFFLINE_NOW';
    }

    const chargerIsUsing = await models.sb_charger_state.count({
      where: {
        chg_id: chg_id,
        cs_charging_state: {
          [Op.notIn]: ['ready', 'available'],
        },
      },
    });

    if (chargerIsUsing) {
      throw 'CHARGER_IS_USING_NOW';
    }

    // try {
    const ocppResult = await resetCharger({ cid: chg_id, type: type }); 
    if (ocppResult?.result && ocppResult?.result.toString() === '000') {
     // ocpp_return = ocppResult['msg'];
      body.resetAt = new Date();
      // 전달된 body로 업데이트
      await charger.update(body, {
        attributes: {
          exclude: ['createdWho', 'updatedWho', 'deletedAt'],
        },
      });
    } else {
      return next('CONNECT_OCPP_FAILED');
    }

    // 업데이트된 충전기 정보 새로고침
    const reloadCharger = await charger.reload({
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });

    // }  catch (e) {
    //   throw 'CONNECT_OCPP_FAILED';
    // }

    // 수정된 정보 응답
    _response.json({
      result: reloadCharger,
      ocpp: ocppResult,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  //   console.error(_error);
  const body =  _request.body;
  const type = body.type;
  if (_error === 'CHARGER_ID_IS_EXIST') {
    _response.error.badRequest(_error, '해당 chg_charger_id를 가진 충전기가 이미 존재합니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '해당 ID에 대한 충전기 정보가 존재하지 않습니다.');
    return;
  }

  if (_error === 'CHARGER_IS_OFFLINE_NOW') {
    _response.error.notFound(_error, '전송이 실패하였습니다.');
    return;
  }

  if (_error === 'CHARGER_IS_USING_NOW') {
    _response.error.notFound(_error, '리셋에 실패하였습니다.');
    return;
  }

  if (_error === 'CONNECT_OCPP_FAILED') {
    if(type == 'Soft'){
      _response.error.notFound(_error, '소프트리셋 충전기가 연결되었을 때 동작합니다. 충전기 연결을 확인해 주세요.');
    }else{
      _response.error.notFound(_error, '하드리셋은 충전기가 연결되었을 때 동작합니다. 충전기 연결을 확인해 주세요.');
    }
    
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
