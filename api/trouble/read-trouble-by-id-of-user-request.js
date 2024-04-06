/**
 * Created by Sarc Bae on 2023-05-26.
 * 소속 ID로 조회 API
 */
'use strict';
const models = require('../../models');
const Sequelize = require('sequelize');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/trouble/user/:troubleId',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.MOBILE],
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
              },
            ],
          },
          {
            model: models.sb_charger_state,
            as: 'chargerStates',
          },
        ],
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
    if (trouble.createdWho !== _request.user.id) {
      throw 'USER_NOT_CREATED_TROUBLE_REPORT';
    }
    const result = {
      id: trouble.id,
      reportDate: trouble.createdAt,
      statusReport: trouble.reportStatus,
      mediaUrl: trouble.mediaUrl,
      troubleTitle: trouble.troubleTitle,
      chgs_name: trouble.chargerTReports?.chargingStation.chgs_name,
      chgs_status: trouble.chargerTReports?.chargingStation.status,
      chgs_address: trouble.chargerTReports?.chargingStation.org.address,
      chgs_operator_manager: trouble.chargerTReports?.chargingStation.operatorManager
        ? trouble.chargerTReports.chargingStation.operatorManager.name
        : null,
      troubleDetail: trouble.troubleDesc,
      chg_id: trouble.chargerTReports?.chg_id,
      chg_status: trouble.chargerTReports?.status,
      modelName: trouble.chargerTReports?.chargersModel?.modelName
        ? trouble.chargerTReports.chargersModel.modelName
        : null,
      maxKw: trouble.chargerTReports?.chargersModel?.maxKw ? trouble.chargerTReports.chargersModel.maxKw : null,
      failue: trouble.chargerTReports?.isJam,
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
