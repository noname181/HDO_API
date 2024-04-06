/**
 * OCPP -> Request -> BE
 * PnC를 통한 차량 인증 요청
 * Request for vehicle certification via PnC
 */
'use strict';
const models = require('../../models');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const { macAddressValidator } = require('../../util/validators');
const { Op } = require('sequelize');
const sequelize = require("sequelize");

module.exports = {
  path: ['/auth-pnc'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

/**
 * 1차 테스트때는 InvalidMacId 를 무조건 리턴하는식으로 하고 넘어간다.
 */

//TODO OCPP Business Logic
async function service(_request, _response, next) {
  const { body } = _request;
  const chg_id = parseInt(body.chg_id) || 0;
  const macId = body.mac_id?.toString() || '';
  const connId = parseInt(body.conn_id) || 1;

  // 기본값
  let result = {
    code: 'InvalidMacId',
    msg: '정보를 찾을수 없거나, 맥주소의 형식이 올바르지 않은 경우',
  }

  try {
    /*
    2023.12.19
    Accepted : 회원정보를 제대로 찾았고, 그 회원정보를 기준으로 결제까지 시킬수 있는 상태
    InUseMacId : 해당 맥주소 차량이 충전중이거나, 그 차량의 소유주 userId가 현재 충전중일때
    InvalidMacId : 맥주소 형식이 틀렸거나, 그 맥주소로 등록된 차량이 없을때
    NotReserveMacId : 충전기가 예약상태인데, 지금 pnc를 시도한 사람이 그 예약한 user가 아닐 경우
    MacInactive : 맥주소로 차량을 찾았는데, usePnc 플래그가 false로 처리되어 있는 경우

    플로우 걸러지는 순서
    1. 맥주소 형식이 올바르지 않으면 바로 짜름. InvalidMacId
    2. 맥주소 형식은 맞는데 차량이 찾아지지 않으면. InvalidMacId
    3. 맥주소로 차량은 찾아졌는데, usePnc가 false이면. MacInactive

    * InUseMacId은 지금 이 API가 호출되는게 sb_charging_log가 생기고나서도 호출되는 경우가 있어서 스킵(동시충전)

    * NotReserveMacId은 지금 예약기능이 만들어져 있지 않기 때문에 스킵

    고로 저 3가지 상황을 건너와서 user가 찾아지면 Accepted를 내려준다.
    예약과 동시충전 막기 관련 개발과 시뮬레이팅이 끝나면 두가지 추가해줘야함.
    => 2024.01.04 일단 동시충전 막기 적용해보기로 함.

    */

    // 1. 맥주소 형식이 올바르지 않으면 바로 짜름. InvalidMacId
    const macAddressPattern = /^([0-9A-Fa-f]{2}){6}$/;
    const isMac = macAddressPattern.test(macId)
    if (!isMac) {
      return
    }

    // 2. 맥주소 형식은 맞는데 차량이 찾아지지 않으면. InvalidMacId
    const lowerMacId = macId?.toLowerCase()
    const vehicle = await models.Vehicle.findOne({
      where: {
        macAddr : sequelize.where(sequelize.fn('LOWER', sequelize.col('macAddr')), lowerMacId),
        deletedAt : { [Op.eq] : null },
      },
      order: [['id', 'DESC']],
    })
    if (!vehicle) {
      return
    }

    // 3. 맥주소로 차량은 찾아졌는데, usePnc가 false이면. MacInactive
    if (vehicle?.usePnC === false) {
      result = {
        code: 'MacInactive',
        msg: '맥주소가 등록되어져 있으나, 사용가능 가능 상태가 아닌경우',
      }
      return
    }

    // 여기까지 return되지 않았다면, user만 찾아지면 일단 accepted 조건 달성된 것.
    // 만약 user를 찾지 못한다면, 그대로 InvalidMacId 기본값이 나가는게 맞는 로직임.
    // 맥주소 형식이 맞고 그 맥주소로 Pnc 사용이 true인 차량도 찾은 경우
    const user = await models.UsersNew.findOne({
      where: {
        id : vehicle?.usersNewId,
        deletedAt : { [Op.eq] : null },
      },
      order: [['id', 'DESC']],
    })
    if (user) {
      // 해당 차량등록 정보에 들어있는 userId로 실제 user를 찾은 경우
      // 4. 동시충전 관련 로직 먼저 검증.
      const chargingExist = await models.sequelize.query(
          `SELECT cl_id
          FROM sb_charging_logs
          WHERE usersNewId = :usersId
          AND cl_unplug_datetime IS NULL
          AND createdAt >= NOW() - INTERVAL 24 HOUR
        `,
          {
            replacements: { usersId: user.id},
            type: sequelize.QueryTypes.SELECT,
            raw: true
          }
      )
      if (chargingExist.length > 0) {
        result = {
          code : "InUseMacId",
          msg : "해당 맥주소 차량이 충전중이거나, 그 차량의 소유주 userId가 현재 충전중."
        }
        return
      }
      // Todo 예약관련 검증.
      // 여기까지 무사히 통과했다면 Accepted 내려줌.
      result = {
        code: 'Accepted',
        msg: '충전기 예약상태X, 해당 맥주소로 충전이 가능하고, 결제가 성공적으로 진행됨',
      }
    }
  } catch (e) {
    console.log("!!! auth_pnd 에러", e?.stack)
  } finally {
    _response.status(HTTP_STATUS_CODE.OK).json({ result });
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}

const AUTH_PNC_RESPONSE = {
  chargerAccepted: {
    code: 'Accepted',
    msg: '충전기 예약상태X, 해당 맥주소로 충전이 가능하고, 결제가 성공적으로 진행됨',
  },
  accepted: {
    code: 'Accepted',
    msg: '충전기 예약상태O, 예약을 진행한 회원의 정보와 일치하고, 결제가 성공적으로 진행됨',
  },
  inUseMacId: {
    code: 'InUseMacId',
    msg: '해당 맥주소(동시에 등록된 다른 맥주소 포함) 또는 맥주소 소유자의 회원카드로 현재 충전중인 상태',
  },
  invalidMacId: {
    code: 'InvalidMacId',
    msg: '정보를 찾을수 없거나, 맥주소의 형식이 올바르지 않은 경우',
  },
  notReserveMacId: {
    code: 'NotReserveMacId',
    msg: '해당 충전기가 예약 상태인경우, 예약한 회원이 아닌 경우',
  },
  macInactive: {
    code: 'MacInactive',
    msg: '맥주소가 등록되어져 있으나, 사용가능 가능 상태가 아닌경우',
  },
};
const authPncResponse = (status) => {
  return AUTH_PNC_RESPONSE[status] || AUTH_PNC_RESPONSE.accepted;
};
