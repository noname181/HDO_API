const Sequelize = require('sequelize');
const models = require('../../../models');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');

const getRefundAmount = {
  path: '/web/getRefundAmount',
  method: 'get',
  checkToken: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

/**
 *
 * @param {userId} _request
 * @param {amount} _response
 * @param {*} next
 */

async function service(_request, _response, next) {
  try {
    const userId = _request.user?.id;
    const date = _request.query.date;

    const refundAmount = await models.sequelize.query(
      `SELECT
        userId AS userId,
        DATE(createdAt) AS date,
        SUM(cancelAmount) AS totalCancelAmount
        FROM RequestRefunds
        WHERE userId = :userId
        AND DATE(createdAt) = DATE(:selectedDate)
        GROUP BY DATE(createdAt)
        ORDER BY DATE(createdAt)`,
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { userId: userId, selectedDate: date },
      }
    );
    return _response.status(HTTP_STATUS_CODE.OK).json({ result: refundAmount });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    _response.status(500).json({ message: 'Internal server error' });
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_request, _response, next) {
  next();
}

module.exports = { getRefundAmount };
