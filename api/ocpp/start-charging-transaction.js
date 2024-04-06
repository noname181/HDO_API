/**
 * Created by hdc on 2023-09-19
 * OCPP -> Request -> BE
 * 충전기, OCPP로부터 실제로 start 되었다는 신호를 받은 후의 로직
 */
"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const {getFormatDate, getKoreanDate} = require("../../util/common-util");
const moment = require('moment');
const {Op} = require("sequelize");

module.exports = {
  path: ["/start-charging-transaction"],
  method: "post",
  checkToken: false,
  roles: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // Request
  const params = {
    chg_id: _request.body.chg_id, // 충전기 인덱스 (int), Charger ID
    conn_id: _request.body.conn_id, // 충전기채널
    transId: _request.body.transId, // 트랜잭션 아이디, TransAction ID
    start_meter: _request.body.start_meter, // 그 충전기의 트랜잭션 시작시 전력량계 미터값
    idTag: _request.body.idTag, // 멤버쉽번호, ID카드번호, 앞에 IC가 붙어있으면 현장결제 고유번호
  };

  // Example
  // {
  //   "chg_id": 2,
  //   "conn_id": 1,
  //   "transId": 12341234,
  //   "start_meter": 231,
  //   "idTag": "IC1111222233334444"
  // }

  let res = {}
  let result = "success";
  let msg = "";

  try {
    if (params?.idTag.startsWith("IC")) {
      // 현장 결제후 시작된 충전일 경우 로직
      // sb_charge_local_ic_pays에 들어있는 정보를 같이 넣어야함.
      // 나중에 부분취소시켜주는거 가능해짐.
      // 현장결제와 앱결제 모두 전력량을 얼마나 충전시켜준건지 기록해야함.

      // sb_charging_logs에 데이터를 넣는다.
      // chg_id 충전기인덱스
      // cl_channel : conn_id  충전기채널번호
      // cl_transaction_id : transId  트랜잭션 아이디
      // cl_order_user_no : idTag  멤버십 카드 ID 또는 현장결제 고유번호
      // cl_start_datetime 트랜잭션 시작시간 ( 자바스크립트 now 타임스탬프로 만들어서 넣기 )
      // appliedUnitPrice 적용단가 (충전기 단가 현재시간으로 조인해서 맞추기) - 나중에 시간별로 다르게 계산한다면 걍 NULL처리
      // cl_start_meter : start_meter 충전기 충전 시작값
      let body = {
        chg_id: params?.chg_id,
        cl_channel: params?.conn_id,
        cl_transaction_id: params?.transId,
        cl_order_user_no: params?.idTag,
        cl_start_meter: params?.start_meter,
      }
      // 충전시작 시간 적용
      body["cl_start_datetime"] = getFormatDate(new Date())

      const hour = moment().tz('Asia/Seoul').hours() + 1 // 0 ~ 23 으로 가져오는데, 현재 컬럼명이 1 ~ 24라 1더함.
      const hourColName = `unitPrice${hour}`

      // 단가는 3가지 중의 하나임.
      // 단가프리셋이 적용되어 있다면, 프리셋의 현재시간 단가. usePreset = 'Y', upSetId is not null
      // 단가프리셋이 적용되어 있지 않지만, 고정단가는 설정된 경우. usePreset = 'N', chg_unit_price is not null
      // 단가프리셋과 고정단가 사용이 모두 안되어 있는 경우. upSetId is null and chg_unit_price is null // Config의 기초데이터가 단가.
      let currentUnitPrice;

      // 현시각 해당 충전기 단가
      const currentUnitPriceResult = await models.sequelize.query(
        ` SELECT ${hourColName}
                FROM UnitPriceSets
               WHERE id = (SELECT upSetId FROM sb_chargers WHERE chg_id = :chg_id)`,
        {
          replacements: { chg_id: params?.chg_id},
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (currentUnitPriceResult.length > 0) {
        currentUnitPrice = currentUnitPriceResult[0][hourColName]
      } else {
        const charger = await models.sb_charger.findByPk(params?.chg_id)
        if (charger?.dataValues?.usePreset === 'N' && charger?.dataValues?.chg_unit_price !== null && charger?.dataValues?.chg_unit_price > 0) {
          currentUnitPrice = charger?.dataValues?.chg_unit_price
        } else {
          // both chg_unit_price and preSet in null
          const defaultPrice = await models.Config.findOne({
            where: {
              divCode: 'DEFAULT_UNITPRICE',
            },
          });
          currentUnitPrice = defaultPrice.cfgVal;
        }
      }
      // 기본단가는 적용되었고, 할인등은 아직 계산되진 않음.
      body["appliedUnitPrice"] = currentUnitPrice


      // 현장결제건 검색
      const momentDay = moment().format('YYYY-MM-DD');

      // ver2 : 현장결제건중
      // 1. cl_id를 키로 물고 있지 않으면서
      // 2. chg_id와 connector_id가 해당 값인 마지막값을 찾는다.
      const localPayLog = await models.sb_charge_local_ic_pay.findOne({
        where: {
          chg_id: params?.chg_id,
          connector_id: params?.conn_id,
          cl_id: null,
        },
        order: [['id', 'DESC']],
      })

      const ordernumber = localPayLog?.ordernumber
      const approvalnumber = localPayLog?.approvalnumber
      body["order_no"] = ordernumber
      body["approval_number"] = approvalnumber


      body["authDate"] = localPayLog?.createdAt
      body["payMethodDetail"] = localPayLog?.cardkey
      // 총충전금액은 여기서 일단 넣고, 차안빼서 붙는 요금은 Charging-stats에서 시점 잡아서 계산한다.

      const authAmtCharge = localPayLog.dataValues?.paid_fee
      body["authAmtCharge"] = authAmtCharge
      // body["authAmtPark"] = localPayLog.dataValues?.??
      const pg_cno = localPayLog?.pg_cno
      if (pg_cno) {
        // 스타트 트랜잭션 전에 노티가 이미 들어와서 이미 거래번호를 가지고 있는 경우
        body["pg_cno"] = pg_cno
      } else {
        // 그렇지 않다면 이 시점에서 다시 위의 두가지값으로 노티를 찾아서 pgCno가 있다면 넣어줘야 한다.
        const icPaymentNotification = await models.PaymentNotification.findOne({
          where: {
            order_no: ordernumber,
            auth_no: approvalnumber
          },
          order: [
            ['id', 'DESC'] // 그중에서도 가장 최신 데이터를
          ],
          limit: 1, // 1개만 선택
        })
        if (icPaymentNotification) {
          body["pg_cno"] = icPaymentNotification?.cno
          localPayLog.pg_cno = icPaymentNotification?.cno
        }
      }
      body["receivePhoneNo"] = localPayLog?.phone

      // 충전소 아이디 넣어주기
      // 충전기 아이디로 충전소 아이디를 셀렉해서 넣어줌.
      const currentCharger = await models.sb_charger.findByPk(params?.chg_id)
      body["chgs_id"] = currentCharger?.chgs_id


      // 사실 현장 현장결제가 시작되기 직전 결제금액과 출차보증금을 통한 역산으로 얼마를 충전하려했는지 추적이 가능하다.
      const DIV_CODE_DEPOSIT = 'PARK_DEPOSIT';
      const depositRow = await models.Config.findOne({
        where: {
          divCode: DIV_CODE_DEPOSIT,
        },
      })
      const depositVal = depositRow?.cfgVal;
      const chargeCost = parseInt(authAmtCharge) - parseInt(depositVal)
      const desired_kwh = (chargeCost / currentUnitPrice) * 1000
      body["desired_kwh"] = desired_kwh
      body["payCompletedYn"] = "N"

      const chargingLog = await models.sb_charging_log.create(body);
      localPayLog.cl_id = chargingLog?.cl_id
      await localPayLog.save()

      // 현장결제로 인한 충전 시작시 무조건 노티피케이션에 데이터 입혀주기(11.30)
      const icPaymentNotification = await models.PaymentNotification.findOne({
        where: {
          order_no: chargingLog?.order_no,
          auth_no: chargingLog?.approvalnumber,
          noti_type: '10'
        },
        order: [
          ['id', 'DESC'] // 그중에서도 가장 최신 데이터를
        ],
        limit: 1, // 1개만 선택
      })
      if (icPaymentNotification && chargingLog) {
        icPaymentNotification.cl_id = chargingLog?.cl_id
        icPaymentNotification.chg_id = chargingLog?.chg_id
        icPaymentNotification.connector_id = chargingLog?.cl_channel
        icPaymentNotification.phone = chargingLog?.receivePhoneNo
        icPaymentNotification.applied_unit_price = chargingLog?.appliedUnitPrice
        icPaymentNotification.desired_kwh = chargingLog?.desired_kwh
        icPaymentNotification.card_no = chargingLog?.payMethodDetail
        await icPaymentNotification.save()
      }
      res = {
        result: "success"
      }
    } else {
      // Rs || NFC ||
      // 앱에서 시작한 충전일 경우 로직 (앱 또는 NFC) 멤버쉽번호로 하면 하나로 통합

      // sb_charging_logs에 데이터를 넣는다.
      // chg_id 충전기인덱스
      // cl_channel : conn_id  충전기채널번호
      // cl_transaction_id : transId  트랜잭션 아이디
      // cl_order_user_no : idTag  멤버십 카드 ID 또는 현장결제 고유번호
      // cl_start_datetime 트랜잭션 시작시간 ( 자바스크립트 now 타임스탬프로 만들어서 넣기 )
      // appliedUnitPrice 적용단가 (충전기 단가 현재시간으로 조인해서 맞추기) - 나중에 시간별로 다르게 계산한다면 걍 NULL처리
      // cl_start_meter : start_meter 충전기 충전 시작값
      let initialTag = params?.idTag
      console.log("!!!!!!!!!!! START 이니셜 태그", initialTag)
      let convertedIdTag = initialTag;
      if( initialTag.startsWith("RS") ){
        convertedIdTag = initialTag.replace("RS","").trim()
      }

      let body = {
        chg_id: params?.chg_id,
        cl_channel: params?.conn_id,
        cl_transaction_id: params?.transId,
        cl_order_user_no: convertedIdTag, // 그냥 유저 pk가 들어가게 된다.
        cl_start_meter: params?.start_meter,
      }

      // user를 찾지 못한다면 시작하지 않는다.
      let isSuccess = false

      // idTag로 확정할 수 있는 유저 정보가 있다면 넣어준다.
      // 1. 앱에선 시작한 경우
      let user;
      user = await models.UsersNew.findByPk(convertedIdTag);
      if (user) {
        // trim된 IdTag로 유저를 찾을 수 있었다면 앱으로 시작한 케이스라고 봐야함.
        body["usersNewId"] = user?.id
        body["receivePhoneNo"] = user?.phoneNo
        body["useType"] = "APP"
        // 해당 시작을 요청한 유저의 마지막 충전요청 정보를 통해 실제 그 유저의 희망 충전유형을 확정한다.
        const cr = await models.sb_charge_request.findOne({
          where: {
            userId: user?.id,
          },
          order: [['cr_id', 'DESC']],
        });
        if (cr) {
          body["desired_kwh"] = cr?.request_kwh
          body["desired_percent"] = cr?.request_percent
          body["desired_amt"] = cr?.request_amt
        }
        isSuccess = true
      } else {
        // 현장시작X, 앱시작X => rfCard 또는 Pnc 스타트인 상황.
        if (initialTag.length === 16) {
          // rfCard 스타트인 케이스
          user = await models.UsersNew.findOne({
            where: {
              physicalCardNo : initialTag,
              deletedAt : { [Op.eq] : null },
            },
            order: [['id', 'DESC']],
          })

          if (user) {
            // rfCard 번호로 유저를 하나 확정 지은 경우
            body["usersNewId"] = user?.id
            body["receivePhoneNo"] = user?.phoneNo
            body["useType"] = "RF"
            isSuccess = true
          }

        } else {
          // 현장시작X, 앱시작X, rfCard시작X인 경우 : 현재 Pnc밖에 가능성이 없음. 2023.12.19

          const macAddressPattern = /^([0-9A-Fa-f]{2}){6}$/;
          const isMac = macAddressPattern.test(initialTag)
          if (isMac) {
            // initialTag가 맥주소 형식인 경우
            const lowerCaseInitialTag = initialTag.toLowerCase();
            const vehicle = await models.Vehicle.findOne({
              where: {
                macAddr : sequelize.where(sequelize.fn('LOWER', sequelize.col('macAddr')), lowerCaseInitialTag),
                deletedAt : { [Op.eq] : null },
                usePnC : true,
              },
              order: [['id', 'DESC']],
            })
            if (vehicle) {
              // 맥주소 형식이 맞고 그 맥주소로 Pnc 사용이 true인 차량도 찾은 경우
              user = await models.UsersNew.findOne({
                where: {
                  id : vehicle?.usersNewId,
                  deletedAt : { [Op.eq] : null },
                },
              })
              if (user) {
                // 해당 차량등록 정보에 들어있는 userId로 실제 user를 찾은 경우
                body["usersNewId"] = user?.id
                body["receivePhoneNo"] = user?.phoneNo
                body["useType"] = "PNC"
                isSuccess = true
              }
            }
          }
        }
      }

      if (!isSuccess) {
        res = {
          result: "fail to find user"
        }
        return
      }

      // 앱일때만 들어가는 정보가 있는지 체크한다.
      const isRemoteStarted = _request.body?.remote
      let remoteObject;
      try {
        remoteObject = JSON.parse(isRemoteStarted);
      } catch (error) {
        remoteObject = null; // 파싱 실패 시 null로 설정
      }
      console.log("remoteObject", remoteObject)
      if (remoteObject && Object.keys(remoteObject).length > 0) {
        body["useType"] = "APP"
        // 아래 값들은 종료조건으로 OCPP로 보냈던 뻥튀기된 정보이기 때문에 우리 DB에 저장할 정보가 아니다.
        // percent로 요청했을땐 금액오바되는걸 깎을 필요가 없고
        // kwh로 요청했을때도 정상작동시 살짝 오바되는 값을 잡손실 처리할 필요가 없다.
        // amt로 요청했을때만 나중에 금액 오바되는 값을 잡손실 처리해주면 된다.
        // 결국 DB에 정확히 요청시의 값들을 넣더라도 나중에 amt만 따져보면 된다.
        // body["desired_kwh"] = parseFloat(remoteObject?.kwh)
        // body["desired_percent"] = parseInt(remoteObject?.targetSoc)
        // body["desired_amt"] = parseInt(remoteObject?.amount);
      }

      // 충전시작 시간 적용
      body["cl_start_datetime"] = getFormatDate(getKoreanDate())
      // 단가 적용
      // 충전기 인덱스를 이용한 단가리턴(현시각)
      // 시간대에 따른 컬럼명 확정
      const hour = moment().tz('Asia/Seoul').hours() + 1 // 0 ~ 23 으로 가져오는데, 현재 컬럼명이 1 ~ 24라 1더함.
      const hourColName = `unitPrice${hour}`

      // 단가는 3가지 중의 하나임.
      // 단가프리셋이 적용되어 있다면, 프리셋의 현재시간 단가. usePreset = 'Y', upSetId is not null
      // 단가프리셋이 적용되어 있지 않지만, 고정단가는 설정된 경우. usePreset = 'N', chg_unit_price is not null
      // 단가프리셋과 고정단가 사용이 모두 안되어 있는 경우. upSetId is null and chg_unit_price is null // Config의 기초데이터가 단가.
      let currentUnitPrice;

      // 현시각 해당 충전기 단가
      const currentUnitPriceResult = await models.sequelize.query(
        ` SELECT ${hourColName}
                FROM UnitPriceSets
               WHERE id = (SELECT upSetId FROM sb_chargers WHERE chg_id = :chg_id)`,
        {
          replacements: { chg_id: params?.chg_id},
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (currentUnitPriceResult.length > 0) {
        currentUnitPrice = currentUnitPriceResult[0][hourColName]
      } else {
        const charger = await models.sb_charger.findByPk(params?.chg_id)
        if (charger?.dataValues?.usePreset === 'N' && charger?.dataValues?.chg_unit_price !== null && charger?.dataValues?.chg_unit_price > 0) {
          currentUnitPrice = charger?.dataValues?.chg_unit_price
        } else {
          // both chg_unit_price and preSet in null
          const defaultPrice = await models.Config.findOne({
            where: {
              divCode: 'DEFAULT_UNITPRICE',
            },
          });
          currentUnitPrice = defaultPrice.cfgVal;
        }
      }
      // 기본단가는 적용되었고, 할인등은 아직 계산되진 않음.

      // 앱에서 충전한 경우 회원이기 때문에 할인을 해줘야함.
      let DIV_CODE_MEMBER_DISC = 'MEMBER_DISC';
      let config2 = await models.Config.findOne({
        where: {
          divCode: DIV_CODE_MEMBER_DISC,
        },
      });
      let memberDiscount = config2?.cfgVal;

      body["appliedUnitPrice"] = currentUnitPrice - memberDiscount ?? 0

      // 충전소 아이디 넣어주기
      // 충전기 아이디로 충전소 아이디를 셀렉해서 넣어줌.
      const currentCharger = await models.sb_charger.findByPk(params?.chg_id)
      body["chgs_id"] = currentCharger?.chgs_id
      body["payCompletedYn"] = "N"
      console.log("앱 충전로그 생성 body", body)
      const chargingLog = await models.sb_charging_log.create(body);
      // 앱으로 시작한 충전은 노티가 들어올때 데이터가 말려들어가기 떄문에 여기서 작업안함.(11.30)

      res = {
        result: "success"
      }
    }
  } catch (e) {
    console.log("스타트 트랜잭션 에러 :", e?.stack)
  } finally {
    _response.json(res);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  if (_error === 'NotFoundPayLog') {
    _response.error.notFound(_error, '해당 결제건을 찾을 수 없습니다.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}