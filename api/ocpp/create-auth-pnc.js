/**
 * OCPP -> Request -> BE
 * PnC 맥주소를 등록 요청 (앱을 통한 충전이 시작된 이후 전송됨)
 * Request to register PnC Mac address (sent after charging through the app)
 */
'use strict';
const models = require('../../models');
const { HTTP_STATUS_CODE, USER_ROLE } = require('../../middleware/role.middleware');
const { macAddressValidator } = require('../../util/validators');
const { Op } = require('sequelize');
const sequelize = require("sequelize");

module.exports = {
  path: ['/reg-pnc'],
  method: 'post',
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { body } = request;
  const chg_id = parseInt(body.chg_id) || 0;
  const macId = body.mac_id?.toString() || '';
  const connId = parseInt(body.conn_id) || 1;
  // 앱결제 idTag : `RS[userId]`
  // 안드로이드 NFC태깅 idTag : 16자리 idTag
  // 실물 RFcard idTag : 실물카드 문자열
  // 현장결제 idTag : `IC[randomString]`

  // 이중에서 user를 확정할 수 있는 경우 : 앱결제, 안드로이드태깅, 실물 RFcard
  let initialTag = body?.idTag
  let convertedIdTag = initialTag;
  let result =  {
    code: 'Accepted',
    msg: '신규로 회원에 맥주소를 등록한 경우',
  }

  try {
    const macAddressPattern = /^([0-9A-Fa-f]{2}){6}$/;
    const isValidMacId = macAddressPattern.test(macId)
    // 맥주소의 형식이 올바르지 않은 경우
    if (!isValidMacId) {
      result = {
        code: 'InvalidMacId',
        msg: '등록이 실패하거나, 맥주소의 형식이 올바르지 않은 경우',
      }
      return
    }

    const lowerCaseMacId = macId.toLowerCase()

    const vehicle = await models.Vehicle.findOne({
      where: {
        macAddr : sequelize.where(sequelize.fn('LOWER', sequelize.col('macAddr')), lowerCaseMacId),
        deletedAt : { [Op.eq] : null },
      }
    })

    if (vehicle) {
      // 이미 어딘가에 등록된 맥주소인 경우
      if (vehicle?.usePnC === true) {
        // 차량등록이 된 맥주소인데 사용중이기까지 하다면
        result = {
          code: 'InUseMacId',
          msg: '기존에 등록되어져 있는 경우',
        }
        return
      } else {
        // 차량등록이 된 맥주소이지만 pnc사용중이 아니라면
        result =  {
          code: 'MacInactive',
          msg: '맥주소가 등록되어져 있으나, 사용가능 가능 상태가 아닌경우',
        }
        return
      }
    }

    // 여기까지 return 되지 않고 흘러들어 왔다면, 처음보는 새로운, 정합성이 맞는 맥주소라는 것이다.

    // 앱에서 충전시작한건 idTag로 구분이 되서 오면 좋겠지만, 아쉽게도 앱으로 시작을 했더라도
    // 현재 요청은 { chg_id : "562", conn_id : "0", mac_id : "ADBCCE1F3245" }
    // 이런식으로 들어오는 실정이다. conn_id가 0으로 들어오는 문제는 꼭 해결해야 할 것으로 판단된다.
    // 정상적이라면 1로 들어오거나, 2로 들어와야 한다.
    // 만약 0 또는 1로 들어오는 개념이라면 1로 바꾸겠으나, 다른곳에서는 1로 들어오고
    // reg-pnc에서만 0이 온다.(2023.12.20)

    // 정합성 부족할 수 있지만, 현재 그 충전기에 들어온 가장 최신의 충전건을 기준으로 user를 찾는 로직 전개. 채널 무시.
    const clog = await models.sb_charging_log.findOne({
      where : {
        chg_id : body?.chg_id
      },
      order : [['cl_id', 'DESC']]
    })
    if (clog?.usersNewId) {
      // 해당 충전기의 최신 충전로그에 유저 아이디가 있으면 그 유저에 lastUsedMacAddr을 업데이트 한다.
      const user = await models.UsersNew.findByPk(clog?.usersNewId)
      user.lastUsedMacAddr = body?.mac_id
      await user.save()
      result =  {
        code: 'Accepted',
        msg: '신규로 회원에 맥주소를 등록한 경우',
      }
    }
    // 아래코드는 initialTag가 RS로 구분되어 들어오지 않기 때문에 사용할 수 없다.(2023.12.20)
    // if ( initialTag !== undefined && initialTag && initialTag.startsWith("RS") ){
    //   // 앱기반 시작이라 회원을 확정할 수 있어서 그 회원에 이 유효성을 통과한 맥주소를 매핑해줄 수 있는 상황이라면
    //   convertedIdTag = initialTag.replace("RS","").trim()
    //   // 앱으로 시작한 경우 그 회원을 찾아 맥주소를 lastUsedMacAddr에 등록해준다.
    //   const user = await models.UsersNew.findByPk(convertedIdTag);
    //   if (user) {
    //     user.lastUsedMacAddr = macId
    //     await user.save()
    //   }
    //   result =  {
    //     code: 'Accepted',
    //     msg: '신규로 회원에 맥주소를 등록한 경우',
    //   }
    // }
  } catch (e) {
    console.log(" !!! regPnc 에러 : ", e?.stack)
  } finally {
    response.status(HTTP_STATUS_CODE.OK).json({ result });
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  console.log('error::', error);
  next();
}

const REG_PNC_RESPONSE = {
  accepted: {
    code: 'Accepted',
    msg: '신규로 회원에 맥주소를 등록한 경우',
  },
  inUseMacId: {
    code: 'InUseMacId',
    msg: '기존에 등록되어져 있는 경우',
  },
  invalidMacId: {
    code: 'InvalidMacId',
    msg: '등록이 실패하거나, 맥주소의 형식이 올바르지 않은 경우',
  },
  macInactive: {
    code: 'MacInactive',
    msg: '맥주소가 등록되어져 있으나, 사용가능 가능 상태가 아닌경우',
  },
};

const regPncResponse = (status) => {
  return REG_PNC_RESPONSE[status] || REG_PNC_RESPONSE.accepted;
};
