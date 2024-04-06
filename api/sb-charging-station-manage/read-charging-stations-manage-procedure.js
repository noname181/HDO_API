/**
 * Created by Sarc bae on 2023-07-14.
 * 충전소 조회 API
 * *
 */
'use strict';
const models = require('../../models');
const { USER_ROLE, HTTP_STATUS_CODE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const { addressMask } = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');

module.exports = {
  path: ['/charging-stations-manage-procedure'],
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

  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) + 1 : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'ASC').toUpperCase();

  // 필터링 정보 - 충전소 Table
  const status = _request.query.status ? _request.query.status.toUpperCase() : 'A';
  const affiliate = _request.query.affiliate ? _request.query.affiliate.split(',') : []; // 제휴전용
  // 필터링 정보 - 소속 Table
  const area = _request.query.area ? parseInt(_request.query.area) : 0;
  const branch = _request.query.branch ? parseInt(_request.query.branch) : 0;
  const gubun = _request.query.gubun ? _request.query.gubun.toLowerCase() : undefined;
  const category = _request.query.org ? _request.query.org.toUpperCase() : 'ALL';
  const haveCarWash = _request.query.wash ? _request.query.wash.toUpperCase() : 'A';
  const haveCVS = _request.query.cvs ? _request.query.cvs : 'A';
  const isUse = _request.query.isUse ? _request.query.isUse.toUpperCase() : 'A';
  const chs_name = _request.query.name || '';
  const orderTargetQueryParam = _request.query.od ? _request.query.od : '';
  const stat_type = _request.query.stat_type ? _request.query.stat_type : 'ALL';
  const searchKey = _request.query.searchKey ? _request.query.searchKey : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal : '';
  const startDate = _request.query.startDate ? _request.query.startDate : '';
  const endDate = _request.query.endDate ? _request.query.endDate : '';
  try {
    const data = await models.sequelize.query(
      `CALL Proc_Get_Charging_Station_List_New(${area}, ${branch}, '${category}', '${isUse}', '${haveCarWash}', '${haveCVS}', '${chs_name}', '${status}', ${pageNum}, ${rowPerPage}, '${orderByQueryParam}', '${orderTargetQueryParam}','${stat_type}', '${searchKey}', '${searchVal}', '${startDate}', '${endDate}', @rowCount);`
    );
    const totalCount = await models.sequelize.query(`SELECT @rowCount;`);

    const chargingStations = data.map((item) => {
      const address = privateView ? item.address : addressMask(item.address);
      return {
        ...item,
        address,
      };
    });

    return _response.status(HTTP_STATUS_CODE.OK).json({
      totalCount: totalCount ? totalCount[0][0]['@rowCount'] : 0,
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
