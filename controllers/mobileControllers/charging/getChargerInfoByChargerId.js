const { USER_ROLE, HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');

const getChargerInfoByChargerId = {
  path: '/chargers/info',
  method: 'get',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { query } = request;
  const chagChargerId = query['chag_charger_id'] || '';

  const chargers = await models.sb_charger.findOne({
    where: {
      chg_charger_id: chagChargerId,
    },
  });

  if (!chargers) {
    return next('CHARGERS_IS_NOT_FOUND');
  }

  const chargersRes = { chgs_id: chargers['chgs_id'], chg_id: chargers['chg_id'] };
  return response.status(HTTP_STATUS_CODE.OK).json(chargersRes);
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'CHARGERS_IS_NOT_FOUND') {
    return response.status(HTTP_STATUS_CODE.NOT_FOUND).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '충전기가 없습니다.',
    });
  }
  next();
}

module.exports = { getChargerInfoByChargerId };
