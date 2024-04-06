'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { USER_TYPE } = require('../../util/tokenService');
const {PERMISSIONS} = require("../../middleware/newRole.middleware");
const {PERMISSION_NAME} = require("../../util/permission.constraints");

module.exports = {
  path: '/afterAction/cost',
  method: 'post',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const cl_id = body?.cl_id;
  const costReason = body?.costReason;
  const requestedUser = await models.UsersNew.findOne({
    where: {
      id : _request.user.id || _request.user.sub
    }
  });
  let costUserId = body?.costUserId
  try {
    if (!costUserId) {
      const requestedUser = await models.UsersNew.findOne({
        where: {
          id : _request.user.id || _request.user.sub
        }
      });
      costUserId = requestedUser?.id
    }
    if (!cl_id) throw 'CL_ID_NEEDED'
    const clog = await models.sb_charging_log.findByPk(cl_id);
    if (!clog) throw 'NOT_EXIST_CHARGING_LOG'
    if (clog?.payCompletedYn === "Y") throw 'ALREADY_PAY_COMPLETED'
    if (clog?.afterAction === "COST" || clog?.afterAction === "PAID") {
      throw "ALREADY_AFTER_ACTION_COMPLETED"
    }

    // 얼마를 잡손실처리 해줘야하는지 구한다.
    let expectedAmt = clog?.expectedAmt
    if (!expectedAmt) {
      const calculatedAmt = Math.floor(clog?.appliedUnitPrice * clog?.cl_kwh * 0.001)
      expectedAmt = calculatedAmt > clog.desired_amt ? clog?.desired_amt : calculatedAmt
    }

    // 잡손실처리에 대한 내역을 저장한다.
    const costInput = {
      cl_id : clog?.cl_id,
      afterAction : 'COST',
      costReason : costReason,
      costUserId : costUserId,
      amount : expectedAmt
    }
    const result = await models.sb_charging_pay_fail_after_action.create(costInput)

    // 충전건에 해당 처리에 대한 데이터들을 업데이트 한다.
    clog.ignored_kwh = clog.cl_kwh
    clog.afterAction = 'COST'
    clog.payCompletedYn = 'Y'
    await clog.save()

    _response.json({
      status: '200',
      result: result,
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

  if (_error === 'CL_ID_NEEDED') {
    _response.error.badRequest(_error, '충전로그 ID가 필요합니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGING_LOG') {
    _response.error.notFound(_error, '충전로그를 찾을 수 없습니다.');
    return;
  }

  if (_error === 'ALREADY_PAY_COMPLETED') {
    _response.error.badRequest(_error, '이미 완료된 결제건 입니다.');
    return;
  }
  if (_error === 'ALREADY_AFTER_ACTION_COMPLETED') {
    _response.error.badRequest(_error, '이미 잡손실 처리 또는 재결제 완료된 결제건 입니다.');
    return;
  }
  _response.error.unknown(_error.toString());
  next(_error);
}
