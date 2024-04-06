'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/unit-price',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  try {
    const { useYN } = _request.query;

    const queryOptions = {
      attributes: [
        'id',
        'Title',
        'desc',
        'useYN',
        [
          models.sequelize.literal(
            `(SELECT COUNT(chg_id) FROM sb_chargers WHERE upSetId = UPSet.id AND chg_use_yn = 'Y')`
          ),
          'Applied',
        ],
        [models.sequelize.fn('COUNT', models.sequelize.col('upSetDetails.id')), 'Period'],
      ],
      include: [
        {
          model: models.UPSetDetail,
          as: 'upSetDetails',
          attributes: [],
        },
      ],
      where: {},
      group: ['UPSet.id'],
    };

    if (useYN !== 'all') {
      queryOptions.where.useYN = useYN;
    }

    const result = await models.UPSet.findAll(queryOptions);

    _response.json({
      result: result,
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
