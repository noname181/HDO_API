'use strict';
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const models = require('../../models');
const { refundRequestFromKICC } = require('../../util/paymentUtil');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/payment-notifications/refunds'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const query = `SELECT cno, amount, card_no FROM PaymentNotifications
    WHERE NOT EXISTS (SELECT 1 FROM sb_charging_logs WHERE pg_cno = cno AND TIMESTAMPDIFF(MINUTE, createdAt, NOW()) >= 10)`;

    const result = await models.sequelize.query(query);
    const data = result[0] || [];

    for (const item of data) {
      const response = await refundRequestFromKICC(item.amount, item.cno);
      if (response.resCd === '0000') {
        await models.sb_charge_request.create({
          request_type: 'REFUND',
          pgCno: item.cno,
          request_percent: 0,
          request_amt: item.amount,
          actual_calculated_amt: item.amount,
          dummy_pay_amt: item.amount,
        });
      }
    }

    return _response.status(HTTP_STATUS_CODE.OK).json({
      result: data,
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

  _response.error.unknown(_error.toString());
  next(_error);
}
