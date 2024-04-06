'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { Op } = require('sequelize');
const changeAvailability = require('../../../util/ocpp/changeAvailability');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: ['/change-charger-availability/:chg_id'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
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
  let msg = '';
  const pass = body.pass;

  try {
    // 해당 chg_id에 대한 충전기 정보 조회
    const charger = await models.sb_charger.findByPk(chg_id, {
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });
    if (!charger) throw 'NOT_EXIST_CHARGER';

    const charger_status = body.charger_status;
    if (!charger_status) {
      throw 'EMPTY_TYPE';
    }

    if (charger_status != 'normal' && charger_status != 'malfunction') {
      throw 'WRONG_TYPE';
    }

    if (charger_status === 'malfunction') {
      // const booking = await models.Booking.findOne({
      //   where: {
      //     chg_id,
      //     b_status: { [Op.in]: ['reserved', 'selected', 'charging'] },
      //   },
      // });
      const chargerStates = await models.sb_charger_state.findAll({
        where: {
          chg_id: chg_id,
        },
        order: [['createdAt', 'DESC']],
      });
      if (chargerStates?.[0]?.cs_charging_state == 'charging') throw 'CHARGER_IN_USE';
    }

    if (charger_status === 'malfunction') {
      msg = '운영 상태를 고장으로 변경했습니다.';
    }else{
      msg = '운영 상태를 정상으로 변경했습니다.';
    }

    // try {
    const type = charger_status === 'malfunction' ? 'Inoperative' : 'Operative';
    const ocppResult = await changeAvailability({ cid: chg_id, connectorId: 0, type: type });
    if (ocppResult?.result && ocppResult?.result.toString() == '000') {
      ocpp_return = ocppResult?.msg.toString();
      body.updatedAt = new Date();
      // 전달된 body로 업데이트
      await charger.update(body, {
        attributes: {
          exclude: ['createdWho', 'updatedWho', 'deletedAt'],
        },
      });
    } else {
      if(pass == 'yes'){
        body.updatedAt = new Date();
        // 전달된 body로 업데이트
        await charger.update(body, {
          attributes: {
            exclude: ['createdWho', 'updatedWho', 'deletedAt'],
          },
        });
      }else{
        throw 'CONNECT_OCPP_FAILED';
      }
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
      msg: msg,
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

  if (_error === 'CHARGER_ID_IS_EXIST') {
    _response.error.badRequest(_error, '해당 chg_charger_id를 가진 충전기가 이미 존재합니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '해당 ID에 대한 충전기 정보가 존재하지 않습니다.');
    return;
  }

  if (_error === 'CHARGER_IS_USING_NOW') {
    _response.error.notFound(_error, '리셋에 실패하였습니다.');
    return;
  }

  if (_error === 'CONNECT_OCPP_FAILED') {
    _response.error.notFound(_error, '전송이 실패하였습니다.');
    return;
  }

  if (_error === 'CHARGER_IN_USE') {
    _response.error.notFound(_error, '충전기는 정상적으로 충전중입니다. 충전종료 후에 다시 시도하세요.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
