'use strict';
const { orderBy } = require('lodash');
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/unit-price-detail',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const id = _request.query.id;
    const upsetDetail = await models.UPSetDetail.findAll({
      where: {
        upSetId: id,
      },
      attributes: ['id', 'upSetId', 'fromDate', 'toDate', 'upTimeTableId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: models.UPTimeTable,
          as: 'upSetDetailbyUpTimeTable',
          attributes: ['desc'],
        },
      ],
    });

    const formattedData = upsetDetail.map((detail) => ({
      id: detail.id,
      upSetId: detail.upSetId,
      fromDate: detail.fromDate,
      toDate: detail.toDate,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
      upTimeTableId: detail.upTimeTableId,
      tableTitle: detail.upSetDetailbyUpTimeTable ? detail.upSetDetailbyUpTimeTable.desc : '',
    }));

    _response.json({
      result: formattedData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
