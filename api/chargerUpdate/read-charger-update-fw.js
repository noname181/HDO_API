/**
 * Created by Sard Bae 2023-08-08.
 * 충전기 QR,AD,TM 업데이트 조회
 */

'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { Op, QueryTypes } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/charger-update/fw',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // const target = _request.params.target.toUpperCase();

  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 9999;

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();
  const orderTargetQueryParam = _request.query.od ? _request.query.od : undefined;

  const update = _request.query.update ? _request.query.update.toUpperCase() : null; // 업데이트 필요 NEED, 업데이트 됨 DONE
  const clause_version = _request.query.clause_version ? _request.query.clause_version : '';

  const searchKey = _request.query.searchKey ? _request.query.searchKey : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal : '';

  let where = {};
  where[Op.and] = [];

  if (_request.query.org) {
    where[Op.and].push({ '$chargingStation.org.category$': _request.query.org });
  }

  // 업데이트가 필요한 충전기를 조회하기 위해 AD, TM에 한해 최신버전 조회
  // let _order =
  //   update && update === 'NEED' && target && (target === 'AD' || target === 'TM') ? [['version', 'DESC']] : [];

  // const { count: totalCount, rows: files } = await models.FileToCharger.findAndCountAll({
  //   where: { division: target },
  //   attributes: {
  //     exclude: ['deletedAt'],
  //   },
  //   limit: 1,
  //   order: _order,
  // });
  // const latestVer = files ? (files.length > 0 ? files[0].version : null) : null;

  // if (update === 'NEED') {
  //   if (target === 'QR') {
  //     where.qrTransDate = { [Op.eq]: null };
  //   } else if (target === 'AD') {
  //     where.adVersion = { [Op.or]: [{ [Op.ne]: latestVer }, { [Op.eq]: null }] };
  //   } else if (target === 'TM') {
  //     where.termsVersion = { [Op.or]: [{ [Op.ne]: latestVer }, { [Op.eq]: null }] };
  //   } else if (target === 'FW') {
  //   } else {
  //     throw 'NOT_EXIST_CATEGORY';
  //   }
  // } else if (update === 'DONE') {
  //   if (target === 'QR') {
  //     where.qrTransDate = { [Op.ne]: null };
  //   } else if (target === 'AD') {
  //     where.adVersion = { [Op.eq]: latestVer };
  //   } else if (target === 'TM') {
  //     where.termsVersion = { [Op.eq]: latestVer };
  //   } else if (target === 'FW') {
  //   } else {
  //     throw 'NOT_EXIST_CATEGORY';
  //   }
  // }

  if (update === 'NEED') {
    where.fwTransDate = { [Op.eq]: null };
  } else if (update === 'DONE') {
    where.fwTransDate = { [Op.ne]: null };
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

  let options = {
    where: where,
    include: [],
    attributes: {
      exclude: [
        'updatedWho',
        'deletedAt',
        'chgs_id',
        'chg_channel',
        'chg_sn',
        'chg_cell-number',
        'usePreset',
        'upSetId',
        'chg_unit_price',
        'reservable',
        'createdAt',
        'updatedAt',
        'chargerModelId',
      ],
    },
    order: order,
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
    subQuery: false,
  };

  options.include.push({
    model: models.sb_charging_station,
    as: 'chargingStation',
    paranoid: false,
    attributes: {
      exclude: [
        'createdWho',
        'updatedWho',
        'deletedAt',
        'coordinate',
        'chrgStartTime',
        'chrgEndTime',
        'washStartTime',
        'washEndTime',
        'chgs_kepco_meter_no',
        'isUse',
        'chgs_car_wash_yn',
        'chgs_aff_only',
        'chgs_field_desc',
      ],
    },
    include: [
      {
        model: models.Org,
        as: 'org',
        paranoid: false,
        attributes: [
          'id',
          'category',
          'fullname',
          'name',
          'address',
          'closed',
          'area',
          'branch',
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

  // options.include.push({
  //   model: models.sb_charger_ocpp_log,
  //   as: 'chargerOCPPLogs',
  //   attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
  // });

  options.include.push({
    model: models.ChargerModel,
    as: 'chargerModel',
    attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
    include: [
      {
        model: models.ChargerModelFW,
        as: 'firmwares',
        where: {
          isLast: true,
        },
        attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
      },
    ],
  });

  options.include.push({
    model: models.UsersNew,
    as: 'createdBy',
    foreignKey: 'createdWho',
    attributes: ['id', 'accountId', 'name', 'phoneNo'],
  });

  const SEARCH_KEY = {
    CHGS_STATION_ID: 'chgs_station_id',
    CHG_STATION_NAME: 'chargingStation',
    CHG_ID: 'chg_charger_id',
    CHG_MODEL_NAME: 'chargerModel',
    ACCOUNT_ID: 'accountId',
    USERNAME: 'user_name',
    PHONE: 'phone',
  };

  // if(target === 'TM' && clause_version){
  //   options.where[Op.and].push({ '$chargerOCPPLogs.version$': { [Op.like]: '' + clause_version + '' } });
  // }else if (target === 'AD' && clause_version){
  //   options.where[Op.and].push({ '$chargerOCPPLogs.version$': { [Op.like]: '' + clause_version + '' } });
  // }

  switch (searchKey) {
    case SEARCH_KEY.CHGS_STATION_ID:
      options.where[Op.and].push({ '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } });
      break;
    case SEARCH_KEY.CHG_STATION_NAME:
      options.where[Op.and].push({ '$chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } });
      break;
    case SEARCH_KEY.CHG_ID:
      options.where[Op.and].push({ chg_charger_id: { [Op.like]: '%' + searchVal + '%' } });
      break;
    case SEARCH_KEY.CHG_MODEL_NAME:
      options.where[Op.and].push({ '$chargerModel.modelName$': { [Op.like]: '%' + searchVal + '%' } });
      break;
    case SEARCH_KEY.ACCOUNT_ID:
      options.where[Op.and].push({ '$createdBy.accountId$': { [Op.like]: '%' + searchVal + '%' } });
      break;
    case SEARCH_KEY.USERNAME:
      options.where[Op.and].push({ '$createdBy.name$': { [Op.like]: '%' + searchVal + '%' } });
      break;
    case SEARCH_KEY.PHONE:
      options.where[Op.and].push({ '$createdBy.phoneNo$': { [Op.like]: '%' + searchVal + '%' } });
      break;
    default:
      options.where[Op.and].push({
        [Op.or]: [
          { '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } },
          { '$chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } },
          { chg_charger_id: { [Op.like]: '%' + searchVal + '%' } },
          { '$chargerModel.modelName$': { [Op.like]: '%' + searchVal + '%' } },
          { '$createdBy.accountId$': { [Op.like]: '%' + searchVal + '%' } },
          { '$createdBy.name$': { [Op.like]: '%' + searchVal + '%' } },
          { '$createdBy.phoneNo$': { [Op.like]: '%' + searchVal + '%' } },
        ],
      });
      break;
  }

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: chargersData } = await models.sb_charger.findAndCountAll(options);

    const chargers = [];
    const listChargerStates = await getChargerState(chargersData);

    for (let item of chargersData) {
      const newItem = { ...item.dataValues };
      const chargerStates = listChargerStates.filter((state) => state.chg_id == item.chg_id);
      chargers.push({ ...newItem, chargerStates });
    }
    // 조회된 사용자 목록 응답
    _response.json({
      totalCount: totalCount,
      result: chargers,
      //latestVer: latestVer || null,
    });
  } catch (e) {
    next(e);
  }
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

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CATEGORY') {
    _response.error.notFound(_error, '존재하지 않는 분류입니다.(QR, AD, TERMS, FW');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
