/**
 * Created by Jackie Yoon on 2023-07-24.
 * 충전소가 미등록된 사업장 조회
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/orgs/unregister/charging-station'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;

  // 조회용 쿼리
  const searchWordName = _request.query.name || null; // 요청 파라미터로 /search/뒤에 붙이던가, query 키 search를 통해 전달.
  const searchWordContactName = _request.query.contact || null; // 요청 파라미터로 /search/뒤에 붙이던가, query 키 search를 통해 전달.

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  // 필터링 정보
  // const category = _request.query.cate ? _request.query.cate.toUpperCase() : undefined;
  const closed = convertQueryParam(_request.query.closed);
  const area = _request.query.area
    ? !isNaN(parseInt(_request.query.area))
      ? parseInt(_request.query.area)
      : undefined
    : undefined;
  const branch = _request.query.branch
    ? !isNaN(parseInt(_request.query.branch))
      ? parseInt(_request.query.branch)
      : undefined
    : undefined;

  let where = {};

  // 소속 조회대상을 직영점, 자영점으로 한정
  where[Op.and] = [];
  where[Op.or] = [];

  where[Op.or].push({ category: 'STT_DIR' });
  where[Op.or].push({ category: 'STT_FRN' });
  where[Op.or].push({ category: 'EV_DIV' });
  // 충전소 테이블의 orgId가 null이면 미등록이므로
  where[Op.and].push({ '$chargingStation.orgId$': null });

  if (searchWordName) {
    where[Op.and].push({ name: { [Op.like]: '%' + searchWordName + '%' } });
  }
  if (searchWordContactName) {
    where[Op.and].push({
      contactName: { [Op.like]: '%' + searchWordContactName + '%' },
    });
  }
  if (closed) where.closed = closed;
  if (area) where.area = area;
  if (branch) where.branch = branch;

  let options = {
    where: where,
    include: [
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.sb_charging_station, as: 'chargingStation', attributes: ['orgId'] }, // Use a unique alias, e.g., 'chargingStation'
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: [['id', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
    subQuery: false, // JOIN된 테이블에서 where절을 걸 때 반드시 넣어야 동작함
  };

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: orgs } = await models.Org.findAndCountAll(options);

    // join된 org 키값 삭제
    for (let i = 0; i < orgs.length; i++) {
      delete orgs[i].dataValues.chargingStation;
    }

    // 조회된 사용자 목록 응답
    _response.json({
      totalCount: totalCount,
      result: orgs,
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

// true/false 분기처리가 필요한 쿼리용 함수
function convertQueryParam(value) {
  const lowercasedValue = value?.toLowerCase();

  return lowercasedValue === 'true'
    ? true
    : lowercasedValue === 'false'
    ? false
    : typeof value === 'string' && value !== ''
    ? value
    : undefined;
}
