/**
 * Created by Sarc bae on 2023-06-01.
 * 충전기 조회 API
 */
'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const sequelize = require('sequelize');
const Op = sequelize.Op;

const {
  addressMask,
  phoneNoMask,
  emailMask,
} = require('../../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../../util/tokenService');

module.exports = {
  path: ['/chargers-manage', '/charging-stations-manage/:chargingStationId/chargers-manage'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargingStationId = _request.params.chargingStationId;

  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 9999;

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
  const orderTargetQueryParam = _request.query.od ? _request.query.od : undefined;

  // 필터링 정보 - 충전기 Table
  const status = _request.query.status ? _request.query.status.toUpperCase() : null; // status - active, inactive, 전체조회는 빈값
  // 필터링 정보 - 충전소 Table
  const searchWord = _request.query.search || null; // query 키 search를 통해 전달.
  // 필터링 정보 - 소속 Table
  const area = _request.query.area ? _request.query.area : '';
  const branch = _request.query.branch ? _request.query.branch.toLowerCase() : undefined;
  const gubun = _request.query.gubun ? _request.query.gubun.toLowerCase() : undefined;
  const category = _request.query.org ? _request.query.org.toUpperCase() : undefined;
  const isJam = _request.query.isJam || null;

  const maxKw = _request.query.maxKw ? _request.query.maxKw.toUpperCase() : undefined;
  const pncAvailable = _request.query.pnc ? _request.query.pnc.toUpperCase() : undefined;

  const searchKey = _request.query.searchKey ? _request.query.searchKey : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal : '';
  const startDate = _request.query.startDate ? _request.query.startDate : '';
  const endDate = _request.query.endDate ? _request.query.endDate : '';
  const chg_use_yn = _request.query.chg_use_yn ? _request.query.chg_use_yn : '';
  const reservable = _request.query.reservable ? _request.query.reservable : '';
  const cs_charging_state = _request.query.cs_charging_state ? _request.query.cs_charging_state : '';
  const charger_status = _request.query.charger_status ? _request.query.charger_status : '';
  const region = _request.query.region ? _request.query.region : '';

  let where = {};
  where[Op.and] = [];
  if (status || searchWord || area || branch || gubun || category || isJam || reservable || chg_use_yn)
    where[Op.and] = [];

  // where문
  if (chg_use_yn) {
    where[Op.and].push({ chg_use_yn: chg_use_yn });
  }
  if (reservable) {
    where[Op.and].push({ reservable: reservable });
  }
  if (status) {
    where[Op.and].push({ '$chargingStation.isUse$': status === 'ACTIVE' ? 'Y' : 'N' });
  }
  if (isJam) {
    where[Op.and].push({ isJam: isJam.toUpperCase() });
  }
  if (charger_status) {
    where[Op.and].push({ charger_status: charger_status });
  }
  if (region) {
    where[Op.and].push({ '$chargingStation.org.region$': region });
  }

  // nested where문
  if (chargingStationId) {
    where.chgs_id = chargingStationId;
  }

  const SEARCH_KEY = {
    CHGS_STATION_ID: 'chgs_station_id',
    CHG_ID: 'chg_charger_id',
    MODEL_NAME: 'modelName',
  };

  if (!chargingStationId) {
    if (searchKey === SEARCH_KEY.CHGS_STATION_ID) {
      where[Op.and].push({ '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } });
    }
    if (searchKey === SEARCH_KEY.CHG_ID) {
      where[Op.and].push({ chg_charger_id: { [Op.like]: '%' + searchVal + '%' } });
    }
    if (searchKey === SEARCH_KEY.MODEL_NAME) {
      where[Op.and].push({ '$chargerModel.modelName$': { [Op.like]: '%' + searchVal + '%' } });
    }
    if (searchKey === '') {
      where[Op.and].push({
        [Op.or]: [
          { '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
          { chg_charger_id: { [Op.like]: '%' + searchVal + '%' } },
          { '$chargerModel.modelName$': { [Op.like]: '%' + searchVal + '%' } },
        ],
      });
    }

    if (startDate !== '' && endDate !== '') {
      where[Op.and].push({ createdAt: { [Op.between]: [startDate, endDate] } });
    } else if (startDate !== '' && endDate === '') {
      where[Op.and].push({ createdAt: { [Op.gte]: startDate } });
    } else if (startDate === '' && endDate !== '') {
      where[Op.and].push({ createdAt: { [Op.lte]: endDate } });
    }
  }

  if (searchWord) {
    where[Op.and].push({
      '$chargingStation.chgs_name$': { [Op.like]: '%' + searchWord + '%' },
    });
  }
  if (area) {
    where[Op.and].push(
      models.sequelize.literal(
        `(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1) = '${area}' `
      )
    );
  }
  if (branch) {
    where[Op.and].push({ '$chargingStation.org.branch$': branch });
  }
  if (gubun) {
    where[Op.and].push({
      '$chargingStation.org.STN_STN_GUBUN$': { [Op.like]: '%' + gubun + '%' },
    });
  }
  if (category) {
    if (category.includes('STATION')) {
      where[Op.or] = [];
      where[Op.or].push({ '$chargingStation.org.category$': 'STT_DIR' });
      where[Op.or].push({ '$chargingStation.org.category$': 'STT_FRN' });
    } else if (category.includes('CONTRACTOR')) {
      where[Op.or] = [];
      where[Op.or].push({ '$chargingStation.org.category$': 'CS' });
      where[Op.or].push({ '$chargingStation.org.category$': 'AS' });
      where[Op.or].push({ '$chargingStation.org.category$': 'RF_CARD' });
    } else if (category.includes('CLIENT')) {
      where[Op.or] = [];
      where[Op.or].push({ '$chargingStation.org.category$': 'BIZ' });
      where[Op.or].push({ '$chargingStation.org.category$': 'ALLNC' });
      where[Op.or].push({ '$chargingStation.org.category$': 'GRP' });
    } else {
      // where[Op.and] = [];  // 위에서 이미 확인함
      where[Op.and].push({
        '$chargingStation.org.category$': { [Op.like]: '%' + category + '%' },
      });
    }
  }

  // 특정 컬럼으로 정렬하기 위한 옵션 추가
  const order = [];

  if (orderTargetQueryParam) {
    // 충전소 이름으로 정렬
    if (orderTargetQueryParam === 'chgs_name') order.push(['chargingStation', 'chgs_name', orderByQueryParam]);

    // 충전기 이름으로 정렬
    if (orderTargetQueryParam === 'chg_charger_id') order.push(['chg_charger_id', orderByQueryParam]);
  }
  order.push(['createdAt', orderByQueryParam]);

  let whereChargerModel = {};
  whereChargerModel[Op.and] = [];
  if (maxKw) {
    whereChargerModel[Op.and].push({ '$chargerModel.maxKw$': maxKw });
  }
  if (pncAvailable) {
    whereChargerModel[Op.and].push({
      '$chargerModel.pncAvailable$': pncAvailable === 'Y' ? true : false,
    });
  }

  let options = {
    where: where,
    include: [
      {
        model: models.ChargerModel,
        as: 'chargerModel',
        attributes: ['modelName', 'maxKw', 'pncAvailable'],
        where: whereChargerModel,
        required: false,
      },
      {
        model: models.UnitPriceSet,
        as: 'UnitPriceSet',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'createdWho', 'updatedWho', 'registerDate'] },
      },
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: order,
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
    subQuery: false,
  };

  //if (!chargingStationId) {
  options.include.push({
    model: models.sb_charging_station,
    as: 'chargingStation',
    paranoid: false,
    attributes: { exclude: ['createdWho', 'updatedWho'] },
    include: [
      {
        model: models.Org,
        as: 'org',
        paranoid: true,
        attributes: [
          'id',
          'category',
          'fullname',
          'name',
          'bizRegNo',
          'address',
          'contactName',
          'contactPhoneNo',
          'contactEmail',
          'deductType',
          'discountPrice',
          'staticUnitPrice',
          'payMethodId',
          'isPayLater',
          'isLocked',
          'billingDate',
          'closed',
          'area',
          'branch',
          'haveCarWash',
          'haveCVS',
          'STN_STN_SEQ',
          'STN_STN_ID',
          'STN_STN_GUBUN',
          'STN_CUST_NO',
          'STN_ASSGN_AREA_GUBUN',
          'STN_COST_CT',
          'STN_PAL_CT',
          'STN_STN_SHORT_NM',
          'erp',
          'region',
          'createdAt',
          'updatedAt',
          [
            models.sequelize.literal(
              `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`
            ),
            'branchName',
          ],
          [
            models.sequelize.literal(
              "(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)"
            ),
            'areaName',
          ],
        ],
      },
      { model: models.UsersNew, as: 'operatorManager', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
  });
  options.include.push({
    model: models.ChargerModel,
    as: 'chargerModel',
    attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
  });
  //}

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: chargersData } = await models.sb_charger.findAndCountAll(options);
    let chargers = [];
    const listChargerStates = await getChargerState(chargersData);
    const listChargingLogs = await getChargingLogs(chargersData);
    for (let item of chargersData) {
      const newItem = { ...item.dataValues };
      const chargerStates = listChargerStates.filter((state) => state.chg_id == item.chg_id);
      // const objectChargingLog = listChargingLogs.find((log) => log.chg_id == item.chg_id) || {};
      // const cl_datetime = objectChargingLog['cl_datetime']
      //   ? objectChargingLog['cl_datetime']
      //   : null;

      const cl_datetime = await models.sb_charging_log.findOne({
        where: { chg_id: item.chg_id },
        order: [['cl_id', 'DESC']],
        attributes: ['cl_datetime'],
      });
      const { privateView = false } = _request;
      if (!privateView) {
        const address = addressMask(item.dataValues.chargingStation.org.address);
        const phoneNo = phoneNoMask(item.dataValues.chargingStation.org.contactPhoneNo);
        const email = emailMask(item.dataValues.chargingStation.org.contactEmail);
        newItem.chargingStation.org.address = address;
        newItem.chargingStation.org.contactPhoneNo = phoneNo;
        newItem.chargingStation.org.contactEmail = email;
      }
      chargers.push({ ...newItem, chargerStates, cl_datetime: cl_datetime?.cl_datetime ?? null });
    }

    if (cs_charging_state) {
      if (cs_charging_state === 'available') {
        chargers = chargers.filter(
          (item) =>
            item.chargerStates[0] &&
            (item.chargerStates[0]?.dataValues.cs_charging_state === cs_charging_state ||
              item.chargerStates[0]?.dataValues.cs_charging_state === 'ready')
        );
      } else if (cs_charging_state === 'installing') {
        chargers = chargers.filter(
          (item) => !item.chargerStates[0] || !item.chargerStates[0]?.dataValues.cs_charging_state
        );
      } else {
        chargers = chargers.filter(
          (item) => item.chargerStates[0] && item.chargerStates[0]?.dataValues.cs_charging_state === cs_charging_state
        );
      }
    }

    return _response.status(200).json({
      totalCount: chargers.length,
      result: chargers,
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

async function getChargerState(chargersData = []) {
  const arrayChargerIds = [];
  for (const item of chargersData) {
    arrayChargerIds.push(item.chg_id);
  }
  const chargerStates = await models.sb_charger_state.findAll({
    where: {
      chg_id: { [Op.in]: arrayChargerIds },
    },
    order: [['createdAt', 'DESC']],
  });
  return chargerStates;
}

async function getChargingLogs(chargersData = []) {
  const arrayChargerIds = [];
  for (const item of chargersData) {
    arrayChargerIds.push(item.chg_id);
  }
  const chargingLog = await models.sb_charging_log.findAll({
    where: {
      chg_id: { [Op.in]: arrayChargerIds },
    },
    order: [['createdAt', 'DESC']],
    attributes: ['cl_datetime', 'chg_id'],
  });
  return chargingLog;
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}
