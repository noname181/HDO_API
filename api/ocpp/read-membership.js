/**
 * OCPP -> Request -> BE
 * 회원 카드 사용 가능 여부 확인
 * Check membership card availability
 *
 * 16자리 카드번호, 충전기에서 받아서 보내주심.
 * 그 카드가 있는지, 블락이 되어있진않은지..
 * 동시충전여부 체크해야함.
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const {Op} = require("sequelize");

module.exports = {
  path: ["/membership"],
  method: "post",
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};


/**
 * membership 이건, 리모트스타트에서 시작된 경우(앱)나 현장결제에선 호출하지 않음.
 *
 * 오직 회원카드태깅(16자리), PNC START(맥주소 12자리)의 경우에만 호출되는 API임.
 * auth pnc와 reg pnc에 대해 정확히 인지하고 있지 않으면, 맥주소 관련 로직은 처리가 불가능.
 * 2023.10.13
 *
 */


//TODO OCPP Business Logic
async function service(_request, _response, next) {
  // Request
  const params = {
    chg_id: _request.body.chg_id, // 충전기 인덱스 (int), Charger ID
    idtag: _request.body.idtag, // 회원 번호 (String), MemberShip Number
  };

  console.log(params);
  let code = "";
  let msg = "";
/*
  code:
      accepted : 사용 가능
      invalid : 등록 안됨
      lost : 분실됨
      notuse : 사용 중지됨
      expired : 유효기간 만료됨
      concurrentTx : 현재 충전 사용중
  msg

  멤버쉽 시나리오 순서
  1. 멤버쉽번호로 찍히든, 맥주소로 찍히든, RS로 찍히든 찾아가는 로직으로 파고들어갔을때 현재 충전중인 데이터가 있으면 동시충전을 내려줌.
  2. 현재 충전중인 데이터가 없다면, 유저테이블에서 멤버쉽번호로 찾아서 찾아지는지 확인하고, 없으면 invalid를 내려줌.
  3. 만약 유저테이블에서 활성화된 유저가 찾아졌다면, 해당 멤버쉽번호로 RfCard 테이블에서 데이터를 찾음.
  4. lost인지, notuse인지, expired인지 확인해서 각각의 분기 메시지를 내려줌.
  5. lost도 아니고, notuse도 아니고, expired도 아니라면 accepted를 내려줌.
*/

  try {
    let initialTag = params.idtag
    let convertedIdTag = initialTag;
    let usersId = null;
    if( initialTag && initialTag.startsWith("RS") ){
      // 만약 RS가 찍혔다면.
      usersId = initialTag.replace("RS","").trim()
    } else if (initialTag && initialTag.length === 12) {
      // 12자리의 initialTag가 넘어오는 경우는 맥어드레스밖에 없음.
      const vehicle = await models.Vehicle.findOne({
        where: {
          macAddr : sequelize.where(sequelize.fn('LOWER', sequelize.col('macAddr')), initialTag),
          deletedAt : { [Op.eq] : null },
        },
        order: [['id', 'DESC']],
      })
      if (vehicle && vehicle?.usePnC) {
        const user = await models.UsersNew.findOne({
          where: {
            id : vehicle?.usersNewId,
            deletedAt : { [Op.eq] : null },
          },
          order: [['id', 'DESC']],
        })
        if (user) {
          usersId = user.id
        }
      }
    } else if (initialTag && initialTag.length === 16) {
      // 16자리의 initailTag가 넘어오는 경우는 rfCardNo밖에 없음.
      // 2024.01.03 현재 유저는 rfCard의 멤버쉽번호를 유저로우 자체에 가지고 있음.
      const user = await models.UsersNew.findOne({
        where: {
          physicalCardNo : initialTag,
          deletedAt : { [Op.eq] : null },
        },
        order: [['id', 'DESC']],
      })
      if (user) {
        usersId = user.id
      }
    }
    if (!usersId) {
      // 만약 user 자체를 찾지 못했다면 해당 충전은 진행 자체가 불가능함.
      code = "invalid"
      msg = "등록 안됨."
      return
    }

    // 여기까지 지나왔다면, RS, PnC, RF카드로 usersId를 찾았음.
    // 동시충전 여부 체크
    const chargingExist = await models.sequelize.query(
        `SELECT cl_id
          FROM sb_charging_logs
          WHERE usersNewId = :usersId
          AND cl_unplug_datetime IS NULL
          AND createdAt >= NOW() - INTERVAL 24 HOUR
        `,
        {
          replacements: { usersId: usersId},
          type: sequelize.QueryTypes.SELECT,
          raw: true
        }
    )
    if (chargingExist.length > 0) {
      code = "concurrentTx"
      msg = "이미 충전중입니다."
      return
    }

    // 여기까지 오면, 입력받은 태그로 사용자를 확정지었는데, 동시충전중이진 않은 상태임.
    code = "accepted"
    msg = "사용 가능한 회원 번호입니다."
    // todo 멤버쉽 관련 로직 최종 완성하기 (2024.01.03)
    // rfCard에 대한 등록, 수정, 삭제등 로직이 완성되면
    // 여기서부터 initialTag의 자리가 16자리이면 이라는 조건을 열고, 번호 검증을 해서
    // 각 번호가 lost인지, notuse인지, expired인지 분기하면 된다.
  } catch (e) {
    console.log(" !!! read Membership 에러 : ", e?.stack)
  } finally {
    const result = { code, msg };
    _response.json({result: result});
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
