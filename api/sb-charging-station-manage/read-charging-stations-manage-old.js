/**
 * Created by Sarc bae on 2023-06-01.
 * 충전소 조회 API
 * * TODO 현재 이 API에 포함된 subQuery 옵션 속성은 명확한 사용방법이나 제약이 확인되지 않았으므로, 사용에 유의할 것(관련 설명은 Notion where절2 참조) by Sarc
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/charging-stations-manage-old'],
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
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 10000;

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  // 필터링 정보 - 충전소 Table
  const status = _request.query.status ? _request.query.status.toUpperCase() : null; // status - active, inactive, 전체조회는 빈값
  const affiliate = _request.query.affiliate ? _request.query.affiliate.split(',') : []; // 제휴전용
  // 필터링 정보 - 소속 Table
  const area = _request.query.area ? _request.query.area.toLowerCase() : undefined;
  const branch = _request.query.branch ? _request.query.branch.toLowerCase() : undefined;
  const gubun = _request.query.gubun ? _request.query.gubun.toLowerCase() : undefined;
  const category = _request.query.org ? _request.query.org.toUpperCase() : undefined;
  const haveCarWash = convertQueryParam(_request.query.wash);

  let where = {};
  if (status || affiliate.length > 0 || area || branch || gubun || category || haveCarWash !== undefined)
    where[Op.and] = [];

  // where문
  if (status) {
    where[Op.and].push({ status: status });
  }
  if (affiliate.length > 0) {
    for (let i of affiliate) {
      where[Op.and].push({ chgs_aff_only: { [Op.like]: '%' + i + '%' } });
    }
  }

  // nested where문
  if (area) {
    where[Op.and].push({ '$org.area$': area });
  }
  if (branch) {
    where[Op.and].push({ '$org.branch$': branch });
  }
  if (gubun) {
    where[Op.and].push({ '$org.STN_STN_GUBUN$': { [Op.like]: '%' + gubun + '%' } });
  }
  if (haveCarWash !== undefined) {
    where[Op.and].push({ '$org.haveCarWash$': haveCarWash });
  }
  if (category) {
    if (category.includes('STATION')) {
      where[Op.or] = [];
      where[Op.or].push({ '$org.category$': 'STT_DIR' });
      where[Op.or].push({ '$org.category$': 'STT_FRN' });
    } else if (category.includes('CONTRACTOR')) {
      where[Op.or] = [];
      where[Op.or].push({ '$org.category$': 'CS' });
      where[Op.or].push({ '$org.category$': 'AS' });
      where[Op.or].push({ '$org.category$': 'RF_CARD' });
    } else if (category.includes('CLIENT')) {
      where[Op.or] = [];
      where[Op.or].push({ '$org.category$': 'BIZ' });
      where[Op.or].push({ '$org.category$': 'ALLNC' });
      where[Op.or].push({ '$org.category$': 'GRP' });
    } else {
      // where[Op.and] = [];  // 위에서 이미 확인함
      where[Op.and].push({ '$org.category$': { [Op.like]: '%' + category + '%' } });
    }
  }

  let options = {
    where: where,
    include: [
      {
        model: models.sb_charger,
        as: 'chargers',
        attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
        include: [
          {
            model: models.sb_charger_state,
            as: 'chargerStates',
            attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
            order: [['createdAt', 'DESC']],
          },
          {
            model: models.ChargerModel,
            as: 'chargerModel',
            required: false,
            attributes: { exclude: ['deletedAt', 'createdWho', 'updatedWho'] },
          },
        ],
      },
      { model: models.Org, as: 'org', attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] } },
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'operatorManager', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
    attributes: {
      include: [],
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: [['id', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
    subQuery: false,
  };

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: chargingStations } = await models.sb_charging_station.findAndCountAll(options);

    // 조회된 사용자 목록 응답
    _response.json({
      totalCount: totalCount,
      result: chargingStations,
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
