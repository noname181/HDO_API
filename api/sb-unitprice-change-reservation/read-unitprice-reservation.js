'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const { Op } = sequelize;

module.exports = {
  path: ['/unit-price-reservation'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page && _request.query.page > 0 ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const where = {
    [Op.and]: [],
  };
  where[Op.and].push({
    date: {
      [Op.gte]: new Date(),
    },
  });
  if(_request.query.chargerId){
    where[Op.and].push({
      chargerId: _request.query.chargerId,
    });
  }

  let include = [
    {
      model: models.UsersNew,
      as: 'createdBy',
      attributes: ['id', 'accountId', 'name', 'email', 'orgId', 'phoneNo'],
    },
    {
      model: models.UsersNew,
      as: 'updatedBy',
      attributes: ['id', 'accountId', 'name', 'email', 'orgId', 'phoneNo'],
    },
    {
      model: models.UnitPriceSet,
      as: 'unitPriceSet',
    },
    {
      model: models.sb_charger,
      as: 'charger',
    },
  ];

  try {
    const { count: totalCount, rows: data } = await models.sb_unitprice_change_reservation.findAndCountAll({
      where,
      include,
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
      order: [['date', 'ASC']],
    });
    const formattedData = data.map(item => ({
      ...item.dataValues,
      date: formatYmdHi_revert(item.dataValues.date),
    }));
    _response.json({
      totalCount,
      result: formattedData,
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

function formatYmdHi_revert(inputString){
  //const inputString = "202312280530";

  // Use regex to extract components
  const match = inputString.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/);

  if (match) {
    // Extract components from the regex match
    const [, year, month, day, hour, minute] = match;

    // Create the output string in the desired format
    const outputString = `${year}-${month}-${day} ${hour}:${minute}:00`;

    return outputString;
  } else {
    return '';
  } 
}