/**
 * Created by Hdc on 2023-10-05.
 * 앱에서 CL 로그 생성 및 데이터 기록 요청
 * 충전기아이디, 채널은 당연히 어떤 충전기에 어떤 커넥터에 대한 충전을 종료할지에 대한 정보이기 때문에 필수
 * 벤더아이디는 벤더마다 시작과 종료의 profile관련 매커니즘이 다르기 때문에 던져줄 필요가 있음
 * 트랜잭션아이디도 어떤 트랜잭션이 종료될지를 확정지어줘야 하기 때문에 필요함
 * 앱에서 qr과 커넥터를 확정짓고 충전을 시작했다면, 충전기 인덱스와 커넥터(충전기채널)는 확정가능
 * 이게 확정되었다면 charger_state를 통해 벤더아이디 확정가능
 * 트랜잭션 아이디는 해당 충전기인덱스, 충전기채널(커넥터)에 대한 Max cl_id를 select해서
 * 가장 최근에 그 기계에 그 커넥터에서 이루어진 마지막 충전 행위에 대한 건을 확정가능
 */
'use strict';
const models = require('../../../models');
const sequelize = require('sequelize');
const { Op } = require('sequelize');
const remoteStopTransaction = require('../../../util/ocpp/remoteStopTransaction');

module.exports = {
  path: ['/request-quit-charge'],
  method: 'post',
  checkToken: true,
  roles: ['admin', 'mobile', 'biz'],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const chg_id = body?.chg_id;

  const connId = body?.conn_id ?? 1;
  try {
    if (!chg_id) throw 'NEED_CHG_ID';
    // implement business logic and call function.
    const userId = body.userId ? body.userId : _request.user.id || _request.user.sub;

    const user = await models.UsersNew.findOne({
      where: { id: userId },
    });
    if (!user) throw 'NOT_EXIST_USER';

    // 충전기 고유 번호로 충전기 id를 조회
    const charger = await models.sb_charger.findOne({
      where: { chg_id: chg_id },
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!charger) throw 'NOT_EXIST_CHARGER';

    // sb_charger_state 조회
    const charger_state = await models.sb_charger_state.findOne({
      where: { chg_id: chg_id, cs_channel: connId },
    });
    const vendorId = charger_state?.cs_vendor ?? '';

    // 마지막 트랜잭션
    const chargingLog = await models.sb_charging_log.findOne({
      where: {
        [Op.and]: [
          {
            chg_id: {
              [Op.eq]: chg_id,
            },
          },
          {
            cl_channel: {
              [Op.eq]: connId,
            },
          },
        ],
      },
      // order by 쿼리 이상한거 해결해라.
      order: [['cl_id', 'DESC']],
    });
    const lastTransActionId = chargingLog?.cl_transaction_id;
    if (!lastTransActionId) throw 'INVALID_TRANSACTION';

    // After business check logic, if charge should stop, call function.
    /**
     * request parameter
     * cid – String 충전기 인덱스
     * vendorId – String 벤더 아이디
     * connId – int 커넥터 인덱스 (1, 2)
     * transId – String 트랜잭션 아이디 (충전중일때, sb_charging_logs.d_transaction_id)
     */
    /**
     * response
     * JSON 성공시 : {"result":"000", "msg": ""}, 실패시 : {"result":"999", "msg": "이유"}
     */
    // define request parameter and call function module.
    const requestParameter = {
      cid: chg_id,
      vendorId: vendorId,
      connId: connId,
      transId: lastTransActionId,
    };
    const callResult = await remoteStopTransaction(requestParameter);

    console.log("!!!!! callResult STOP", callResult)

    if (callResult?.result && callResult?.result.toString() === '000') {
      _response.json({
        result: '000',
        msg: callResult?.msg ?? 'success',
      });
    } else {
      _response.json({
        result: '999',
        msg: callResult?.msg ?? 'fail',
      });
    }
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NEED_CHG_ID') {
    _response.error.badRequest(_error, '충전기 아이디(인덱스)가 누락되었습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_USER') {
    _response.error.badRequest(_error, '사용자(userId)를 찾을 수 없습니다..');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '충전기 정보를 찾을 수 없습니다.');
    return;
  }

  if (_error === 'INVALID_TRANSACTION') {
    _response.error.notFound(_error, '트랜잭션 정보를 찾을 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
