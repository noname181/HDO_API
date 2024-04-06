/**
 * Created by inju on 2023-06-05.
 * 충전기 모델 insert
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/file-to-update',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 1000;

  // 조회용 쿼리
  const category = _request.query.division ? _request.query.division.toUpperCase() : null;
  const startDate = _request.query.startDate;
  const endDate = _request.query.endDate;
  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  let where = {
    [Op.and]: [],
  };

  if (category && category != 'ALL') {
    where.division = category;
  }

  if (startDate || endDate) {
    if (startDate) {
      where[Op.and].push({ createdAt: { [Op.gte]: `${startDate} 00:00:00` } });
    }

    if (endDate) {
      where[Op.and].push({ createdAt: { [Op.lte]: `${endDate} 23:59:59:999` } });
    }
  }

  let options = {
    where: where,
    include: [
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
    attributes: {
      exclude: ['deletedAt'],
    },
    order: [['id', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: files } = await models.FileToCharger.findAndCountAll(options);

    // 조회된 사용자 목록 응답
    _response.json({
      totalCount: totalCount,
      result: files,
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

  if (_error === 'RETRIEVE_CONFIG_FAILED') {
    _response.error.notFound(_error, '설정(CONFIG)값 조회에 실패하였습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
