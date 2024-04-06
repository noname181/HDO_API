'use strict';
const models = require('../../models');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/trouble/user'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  const options = {
    where: {
      createdWho: _request.user.id,
    },
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
  };
  try {
    const { count: totalCount, rows: troubleReports } = await models.TroubleReport.findAndCountAll(options);
    const result = troubleReports.map((item) => {
      const category = item.chargingStation?.org?.category ? item.chargingStation?.org?.category : null;

      return {
        id: item.id,
        reportDate: item.createdAt,
        mediaUrl: item.mediaUrl,
        statusReport: item.reportStatus,
        troubleTitle: item.troubleTitle,
        chgs_name: item.chargingStation?.chgs_name,
        chg_charger_id: item.chargers?.chg_charger_id ? item.chargers?.chg_charger_id : null,
        chgs_id: item.chargingStation?.chgs_id,
        chgs_status: item.chargingStation?.status,
        chgs_station_id: item.chargingStation?.chgs_station_id,
        chgs_address: item.chargingStation?.org?.address || '',
        chgs_operator_manager: item.chargingStation?.operatorManager
          ? item.chargers.chargingStation?.operatorManager.name
          : null,
        troubleDetail: item.troubleDesc,
        chg_id: item.chg_id,
        chg_status: item.chargers?.status,
        modelName: item.chargers?.chargersModel?.modelName ? item.chargers.chargersModel.modelName : null,
        maxKw: item.chargers?.chargersModel?.maxKw ? item.chargers.chargersModel.maxKw : null,
        failue: item.chargers?.isJam,
        userId: item.createdBy?.id ? item.createdBy.id : null,
        userName: item.createdBy?.name ? item.createdBy?.name : null,
        accountId: item.createdBy?.accountId ? item.createdBy?.accountId : null,
        userPhone: item.createdBy?.phoneNo || '',
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

    _response.json({
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

  _response.error.unknown(_error.toString());
  next(_error);
}
