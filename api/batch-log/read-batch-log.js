'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { USER_TYPE } = require('../../util/tokenService');
const {
  userIdMask,
  nameMask,
  emailMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');

module.exports = {
  path: ['/web/batch-log'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.MOBILE, USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const odby = _request.query.odby ? _request.query.odby.toUpperCase() : 'DESC';
  const startDate = _request.query.startDate || null;
  const endDate = _request.query.endDate || null;
  const division = _request.query.division ? _request.query.division.toUpperCase() : null;
  const status = _request.query.status || null;
  
  const whereQuery = {
    [Op.and]: [{}],
  };
  
  whereQuery[Op.and].push({ [Op.or]: [{data_gubun: "STATION"}, {data_gubun: "USER"}, {data_gubun: "SITE"}] });

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    whereQuery[Op.and].push({
        data_time: {
        [Op.between]: [start, end],
      },
    });
  } else if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    whereQuery[Op.and].push({
        data_time: {
        [Op.gte]: start,
      },
    });
  } else if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    whereQuery[Op.and].push({
      data_time: {
        [Op.lte]: end,
      },
    });
  }

  if (division) {
    if (division.trim() === 'STATION') {
      whereQuery[Op.and].push({ data_gubun: { [Op.eq]: division } });
    }

    if (division.trim() === 'USER') {
      whereQuery[Op.and].push({ data_gubun: { [Op.eq]: division } });
    }

    if (division.trim() === 'SITE') {
      whereQuery[Op.and].push({ data_gubun: { [Op.eq]: division } });
    }

    // if (division.trim() === 'KICC') {
    //   whereQuery[Op.and].push({ [Op.or]: [{data_gubun: "KICC"}, {data_gubun: "DEPOSIT"}] });
    // }
  }

  if(status){
    if (status === 'S') {
      whereQuery[Op.and].push({ data_results: { [Op.eq]: status } });
    }else{
      whereQuery[Op.and].push({ data_results: { [Op.ne]: 'S' } });
    }
  }

  let options = {
    where: whereQuery,
    order: [['data_time', odby]],
    offset: (pageNum - 1) * rowPerPage,
    limit: rowPerPage,
  };

  try {
    const { count: totalCount, rows: data_tbs } = await models.data_results_tb.findAndCountAll(options);

    // 조회된 사용자 목록 응답
    _response.json({
      status: '200',
      totalCount: totalCount,
      result: data_tbs,
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
