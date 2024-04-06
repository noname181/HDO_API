/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const models = require('../../models');
const Sequelize = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const {
  phoneNoMask,
  addressMask,
  nameMask,
  userIdMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');

module.exports = {
  path: '/trouble/:troubleId',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const troubleId = _request.params.troubleId;

  // Querying 옵션1 - 언어 전체 조회
  const option = {
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
            model: models.Org,
            as: 'org',
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
  };

  try {
    if (!troubleId) throw 'NO_TROUBLE_ID';

    const trouble = await models.TroubleReport.findByPk(troubleId, option);
    if (!trouble) throw 'NOT_EXIST_TROUBLE_REPORT';

    let category = trouble.chargingStation?.org?.category ? trouble.chargingStation?.org?.category : null;

    const result = {
      id: trouble.id,
      reportDate: trouble.createdAt,
      mediaUrl: trouble.mediaUrl,
      content: trouble.content,
      statusReport: trouble.reportStatus,
      troubleTitle: trouble.troubleTitle,
      chgs_name: trouble.chargingStation?.chgs_name,
      chg_charger_id: trouble.chargers?.chg_charger_id ? trouble.chargers?.chg_charger_id : null,
      chgs_id: trouble.chargingStation?.chgs_id,
      chgs_status: trouble.chargingStation?.status,
      chgs_station_id: trouble.chargingStation?.chgs_station_id,
      chgs_address: addressMask(trouble.chargingStation?.org?.address),
      chgs_operator_manager: trouble.chargingStation?.operatorManager
        ? trouble.chargers.chargingStation?.operatorManager.name
        : null,
      troubleDetail: trouble.troubleDesc,
      chg_id: trouble.chg_id,
      chg_status: trouble.chargers?.status,
      modelName: trouble.chargers?.chargersModel?.modelName ? trouble.chargers.chargersModel.modelName : null,
      maxKw: trouble.chargers?.chargersModel?.maxKw ? trouble.chargers.chargersModel.maxKw : null,
      failue: trouble.chargers?.isJam,
      userId: trouble?.createdBy?.id ? trouble?.createdBy?.id : null,
      userName: nameMask(trouble.createdBy?.name ?? ''),
      accountId: userIdMask(trouble.createdBy?.accountId ?? ''),
      userPhone: phoneNoMask(trouble.createdBy?.phoneNo ?? ''),
      area: trouble.chargingStation?.org?.area ? trouble.chargingStation?.org?.area : null,
      branch: trouble.chargingStation?.org?.branch ? trouble.chargingStation?.org?.branch : null,
      areaName: trouble.chargingStation?.org?.dataValues?.areaName
        ? trouble.chargingStation?.org?.dataValues.areaName
        : null,
      branchName: trouble.chargingStation?.org?.dataValues?.branchName
        ? trouble.chargingStation?.org?.dataValues.branchName
        : null,
      category: category,
      stat_type: category == 'STT_DIR' ? '직영' : '자영',
    };

    _response.json({
      result: result,
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

  if (_error === 'NO_TROUBLE_ID') {
    _response.error.notFound(_error, '소속 ID가 입력되지 않았습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_TROUBLE_REPORT') {
    _response.error.notFound(_error, '해당 ID에 대한 소속 정보가 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
