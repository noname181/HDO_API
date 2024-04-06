/**
 * Created by Sarc bae on 2023-07-14.
 * 충전소 조회 API
 * *
 */
'use strict';
const { Op } = require('sequelize');
const models = require('../../models');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const { addressMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { getGeoCodeFromAddress } = require('../../services/naverServices/naverMap.service');

module.exports = {
  path: ['/charging-stations-manage'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const { privateView = false } = _request;

  const pageNum = _request.query.page ? parseInt(_request.query.page) + 1 : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const odby = (_request.query.odby ? _request.query.odby : 'ASC').toUpperCase();

  const category = _request.query.org ? _request.query.org.toUpperCase() : '';
  const status = _request.query.status ? _request.query.status.toUpperCase() : '';
  const haveCarWash = _request.query.wash ? _request.query.wash.toUpperCase() : '';
  const area = _request.query.area ? _request.query.area : '';
  const branch = _request.query.branch ? parseInt(_request.query.branch) : 0;
  const startDate = _request.query.startDate ? _request.query.startDate : '';
  const endDate = _request.query.endDate ? _request.query.endDate : '';
  const region = _request.query.region ? _request.query.region : '';

  const searchKey = _request.query.searchKey ? _request.query.searchKey : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal : '';

  try {
    const SEARCH_KEY = {
      CHGS_STATION_ID: 'chgs_station_id',
      CHG_STATION_NAME: 'chgs_name',
      ADDRESS: 'address',
      CHGS_KEPCO_METER_NO: 'chgs_kepco_meter_no',
      CHGS_OPERATOR_MANAGER_ID: 'chgs_operator_manager_id',
    };

    const where = {
      [Op.and]: [],
    };

    let chargingStationsinclude = [
      {
        model: models.Org,
        foreignKey: 'orgId',
        paranoid: false,
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
        as: 'org',
      },
    ];

    if (status) where[Op.and].push({ status });
    if (category) where[Op.and].push({ '$org.category$': category });
    if (haveCarWash) where[Op.and].push({ '$org.haveCarWash$': haveCarWash });
    if (area) {
      where[Op.and].push(
        models.sequelize.literal(
          `(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1) = '${area}' `
        )
      );
    }
    if (branch) where[Op.and].push({ '$org.branch$': branch });
    if (region) where[Op.and].push({ '$org.region$': region });

    if (startDate || endDate) {
      if (startDate && endDate) {
        where[Op.and].push({ createdAt: { [Op.between]: [startDate, endDate] } });
      } else if (startDate) {
        where[Op.and].push({ createdAt: { [Op.gte]: startDate } });
      } else if (endDate) {
        where[Op.and].push({ createdAt: { [Op.lte]: endDate } });
      }
    }

    if (searchVal) {
      switch (searchKey) {
        case SEARCH_KEY.CHGS_STATION_ID:
          where[Op.and].push({ chgs_station_id: { [Op.like]: '%' + searchVal + '%' } });
          break;
        case SEARCH_KEY.CHG_STATION_NAME:
          where[Op.and].push({ chgs_name: { [Op.like]: '%' + searchVal + '%' } });
          break;
        case SEARCH_KEY.ADDRESS:
          where[Op.and].push({ '$org.address$': { [Op.like]: '%' + searchVal + '%' } });
          break;
        case SEARCH_KEY.CHGS_KEPCO_METER_NO:
          where[Op.and].push({ chgs_kepco_meter_no: { [Op.like]: '%' + searchVal + '%' } });
          break;
        case SEARCH_KEY.CHGS_OPERATOR_MANAGER_ID:
          where[Op.and].push({ chgs_operator_manager_id: { [Op.like]: '%' + searchVal + '%' } });
          break;
        default:
          where[Op.and].push({
            [Op.or]: [
              { chgs_station_id: { [Op.like]: '%' + searchVal + '%' } },
              { chgs_name: { [Op.like]: '%' + searchVal + '%' } },
              { '$org.address$': { [Op.like]: '%' + searchVal + '%' } },
              { chgs_kepco_meter_no: { [Op.like]: '%' + searchVal + '%' } },
              { chgs_operator_manager_id: { [Op.like]: '%' + searchVal + '%' } },
            ],
          });
          break;
      }
    }

    const { count: totalCount, rows: data } = await models.sb_charging_station.findAndCountAll({
      where,
      include: chargingStationsinclude,
      attributes: [
        'chgs_id',
        'chgs_station_id',
        'status',
        'chgs_name',
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
        'area_code_id',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'orgId',
        'chgs_operator_manager_id',
        'activeStationYN',
        'createdWho',
        'updatedWho',
        [
          models.sequelize.literal(
            `(SELECT MAX(CM.maxKw) FROM sb_chargers CHG JOIN ChargerModels CM ON CM.id = CHG.chargerModelId WHERE CHG.chgs_id = sb_charging_station.chgs_id GROUP BY CHG.chgs_id)`
          ),
          'maxPower',
        ],
        [
          models.sequelize.literal(
            `(SELECT COUNT(*) FROM sb_chargers CHG WHERE CHG.chgs_id = sb_charging_station.chgs_id AND CHG.deletedAt IS NULL GROUP BY CHG.chgs_id)`
          ),
          'cntCharger',
        ],
      ],
      order: [['createdAt', odby]],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
    });

    const chargingStations = await Promise.all(
      data.map(async (item) => {
        const address = privateView ? item.dataValues.org?.address : addressMask(item.dataValues.org?.address);
        const coordinate = item.dataValues?.org?.address
          ? await getGeoCodeFromAddress(item.dataValues?.org?.address)
          : item.coordinate;
        return {
          ...item.dataValues,
          category: item.dataValues.org?.dataValues.category || '',
          stat_type: item.dataValues.org?.dataValues.category === 'STT_DIR' ? '직영' : '자영',
          address,
          areaName: item.dataValues.org?.dataValues.areaName ? item.dataValues.org.dataValues.areaName : '',
          branchName: item.dataValues.org?.dataValues.branchName ? item.dataValues.org.dataValues.branchName : '',
          coordinate,
        };
      })
    );

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount,
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
