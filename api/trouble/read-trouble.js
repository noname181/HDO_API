/**
 * Created by Sarc bae on 2023-05-30.
 * Config 조회 API
 */
'use strict';
const { USER_ROLE } = require('../../middleware/role.middleware');
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const cryptor = require('../../util/cryptor');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const {
  phoneNoMask,
  addressMask,
  nameMask,
  userIdMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');

module.exports = {
  path: ['/trouble'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { privateView = false } = _request;
  // 페이징 정보

  // 조회용 쿼리
  const searchCharName = _request.query.charName || null;
  const searchReportTer = _request.query.reportTer || null;
  const searchTitle = _request.query.title || null;
  const searchChgs_id = _request.query.chgs_id || null;
  const searchUserName = _request.query.userName || null;
  const searchKey = _request.query.searchKey || '';
  const searchVal = _request.query.searchVal || '';
  const startDate = _request.query.startDate || '';
  const endDate = _request.query.endDate || '';
  // 정렬 정보
  const status = _request.query.status ? _request.query.status.toUpperCase() : undefined;
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 1000;

  // ...

  let where = {
    [Op.and]: [],
  };
  if (searchCharName) {
    where[Op.and].push({
      '$chargingStation.chgs_name$': {
        [Op.like]: '%' + searchCharName + '%',
      },
    });
  }
  if (searchChgs_id) {
    where[Op.and].push({
      '$chargingStation.chgs_id$': {
        [Op.like]: '%' + searchChgs_id + '%',
      },
    });
  }
  if (searchUserName) {
    where[Op.and].push({
      '$createdBy.name$': {
        [Op.like]: '%' + cryptor.encrypt(searchUserName) + '%',
      },
    });
  }
  if (status) {
    where[Op.or] = [];
    where[Op.or].push({ reportStatus: status });
  }
  if (searchTitle) {
    where[Op.and].push({
      troubleTitle: { [Op.like]: '%' + searchTitle + '%' },
    });
  }

  const SEARCH_KEY = {
    CHGS_STATION_ID: 'chgs_station_id',
    CHGS_NAME: 'chgs_name',
    CHGS_ADDRESS: 'chgs_address',
    CHG_ID: 'chg_charger_id',
    CHG_OPERATOR_MANAGER: 'chgs_operator_manager',
    ACCOUNT_ID: 'accountId',
    USERNAME: 'userName',
    PHONE: 'userPhone',
    MODEL_NAME: 'modelName',
  };

  if (searchKey === SEARCH_KEY.CHGS_STATION_ID) {
    where[Op.and].push({ '$chargingStation.chgs_station_id$': { [Op.like]: '%' + searchVal + '%' } });
  }
  if (searchKey === SEARCH_KEY.CHGS_NAME) {
    where[Op.and].push({ '$chargingStation.chgs_name$': { [Op.like]: '%' + searchVal + '%' } });
  }
  if (searchKey === SEARCH_KEY.CHGS_ADDRESS) {
    where[Op.and].push({ '$chargingStation.org.address$': { [Op.like]: '%' + searchVal + '%' } });
  }
  if (searchKey === SEARCH_KEY.CHG_ID) {
    where[Op.and].push({ '$chargers.chg_charger_id$': { [Op.like]: '%' + searchVal + '%' } });
  }
  if (searchKey === SEARCH_KEY.CHG_OPERATOR_MANAGER) {
    where[Op.and].push({
      '$chargingStation.operatorManager.name$': { [Op.like]: '%' + searchVal + '%' },
    });
  }
  if (searchKey === SEARCH_KEY.ACCOUNT_ID) {
    where[Op.and].push({ '$createdBy.accountId$': { [Op.like]: '%' + searchVal + '%' } });
  }
  if (searchKey === SEARCH_KEY.USERNAME) {
    where[Op.and].push({ '$createdBy.name$': { [Op.like]: '%' + searchVal + '%' } });
  }
  if (searchKey === SEARCH_KEY.PHONE) {
    where[Op.and].push({ '$createdBy.phoneNo$': { [Op.like]: '%' + searchVal + '%' } });
  }
  if (searchKey === SEARCH_KEY.MODEL_NAME) {
    where[Op.and].push({ '$chargers.chargersModel.modelName$': { [Op.like]: '%' + searchVal + '%' } });
  }

  if (startDate !== '' && endDate !== '') {
    where[Op.and].push({ createdAt: { [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59:999`] } });
  } else if (startDate !== '' && endDate === '') {
    where[Op.and].push({ createdAt: { [Op.gte]: `${startDate} 00:00:00` } });
  } else if (startDate === '' && endDate !== '') {
    where[Op.and].push({ createdAt: { [Op.lte]: `${endDate} 23:59:59:999` } });
  }

  const options = {
    where: where,
    include: [
      {
        model: models.sb_charger,
        as: 'chargers',
        include: [
          {
            model: models.ChargerModel,
            as: 'chargersModel',
          },
          {
            model: models.sb_charger_state,
            as: 'chargerStates',
          },
        ],
      },
      {
        model: models.sb_charging_station,
        as: 'chargingStation',
        include: [
          {
            model: models.UsersNew,
            as: 'operatorManager',
          },
          {
            model: models.Org,
            as: 'org',
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
        ],
      },
      {
        model: models.UsersNew,
        as: 'createdBy',
      },
    ],
    attributes: {
      exclude: ['deletedAt'],
    },
    order: [['createdAt', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    subQuery: false,
    distinct: true,
  };
  try {
    const { count: totalCount, rows: troubleReports } = await models.TroubleReport.findAndCountAll(options);
    //console.log('troubleReports---->', troubleReports)
    const result = troubleReports.map((item) => {
      const category = item.chargingStation?.org?.category ? item.chargingStation?.org?.category : null;

      let chgsAddress = '';

      if (privateView && item.chargingStation?.org) {
        chgsAddress = item.chargingStation?.org?.address;
      } else if (!privateView && item.chargingStation?.org) {
        addressMask(item.chargingStation?.org?.address);
      }

      //const userPhone = privateView ? item.createdBy?.phoneNo : phoneNoMask(item.createdBy?.phoneNo);
      const userPhone = phoneNoMask(item.createdBy?.phoneNo ?? '');
      const userName = nameMask(item.createdBy?.name ?? '');
      const userAccountId = userIdMask(item.createdBy?.accountId ?? '');

      return {
        id: item.id,
        reportDate: item.createdAt,
        mediaUrl: item.mediaUrl,
        content: item.content,
        statusReport: item.reportStatus,
        troubleTitle: item.troubleTitle,
        chgs_name: item.chargingStation?.chgs_name,
        chg_charger_id: item.chargers?.chg_charger_id ? item.chargers?.chg_charger_id : null,
        chgs_id: item.chargingStation?.chgs_id,
        chgs_status: item.chargingStation?.status,
        chgs_station_id: item.chargingStation?.chgs_station_id,
        chgs_address: chgsAddress,
        chgs_operator_manager: item.chargingStation?.operatorManager
          ? item.chargers.chargingStation?.operatorManager.name
          : null,
        troubleDetail: item.troubleDesc,
        chg_id: item.chg_id,
        chg_status: item.chargers?.status,
        modelName: item.chargers?.chargersModel?.modelName ? item.chargers.chargersModel.modelName : null,
        maxKw: item.chargers?.chargersModel?.maxKw ? item.chargers.chargersModel.maxKw : null,
        failue: item.chargers?.isJam,
        userId: item?.createdBy?.id ? item?.createdBy?.id : null,
        userName: userName,
        accountId: userAccountId,
        userPhone: userPhone,
        area: item.chargingStation?.org?.area ? item.chargingStation?.org?.area : null,
        branch: item.chargingStation?.org?.branch ? item.chargingStation?.org?.branch : null,
        areaName: item.chargingStation?.org?.dataValues?.areaName
          ? item.chargingStation?.org?.dataValues.areaName
          : null,
        branchName: item.chargingStation?.org?.dataValues?.branchName
          ? item.chargingStation?.org?.dataValues.branchName
          : null,
        category: category,
        stat_type: category == 'STT_DIR' ? '직영' : '자영',
      };
    });
    return _response.json({
      result: result,
      totalCount: totalCount,
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
