/**
 * Created by Sarc bae on 2023-05-30.
 * Config 조회 API
 */
'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const xlsx = require('xlsx');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/trouble/exportExcel'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // 페이징 정보

  // 조회용 쿼리
  const searchCharName = _request.query.charName || null;
  const searchReportTer = _request.query.reportTer || null;
  // 정렬 정보
  const status = _request.query.status ? _request.query.status.toUpperCase() : undefined;
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'ASC').toUpperCase();

  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 1000;

  // ...

  let where = {};
  if (where[Op.and] === undefined) where[Op.and] = [];
  if (searchCharName) {
    where[Op.and].push({
      '$chargerTReports.chargingStation.chgs_name$': {
        [Op.like]: '%' + searchCharName + '%',
      },
    });
  }
  if (status) {
    where[Op.or] = [];
    where[Op.or].push({ reportStatus: status });
  }

  const options = {
    where: where,
    include: [
      {
        model: models.sb_charger,
        as: 'chargerTReports',
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
    order: [['id', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };
  try {
    const troubleReports = await models.TroubleReport.findAll(options);
    const result = troubleReports.map((item) => {
      return {
        신고일시: item.createdAt,
        상태: item.reportStatus,
        제목: item.troubleTitle,
        내용: item.troubleDesc,
        충전소명: item.chargerTReports?.chargingStation.chgs_name,
        운영: item.chargerTReports?.chargingStation.status,
        주소: item.chargerTReports?.chargingStation.org.address,
        현장담당자: item.chargerTReports?.chargingStation.operatorManager
          ? item.chargerTReports.chargingStation.operatorManager.name
          : null,
        '충전기 ID': item.chargerTReports?.chg_id,
        상태: item.chargerTReports?.status,
        고장여부: item.chargerTReports?.isJam,
        모댈명: item.chargerTReports?.chargersModel?.modelName ? item.chargerTReports.chargersModel.modelName : null,
        속도: item.chargerTReports?.chargersModel?.maxKw ? item.chargerTReports.chargersModel.maxKw : null,
      };
    });
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(result);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Trouble Reports');
    const excelBuffer = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    _response.setHeader('Content-Disposition', 'attachment; filename=TroubleReports.xlsx');
    _response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    _response.end(excelBuffer);
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
