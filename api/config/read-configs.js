/**
 * Created by Sarc bae on 2023-05-30.
 * Config 조회 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;

module.exports = {
  path: ['/config'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  permissions: [],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // 페이징 정보
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 1000;

  // 조회용 쿼리
  const searchWord = _request.query.search || ''; // 요청 파라미터로 /search/뒤에 붙이던가, query 키 search를 통해 전달.
  const category = _request.query.category ? _request.query.category : '';

  console.log({ searchWord, category });

  // 정렬 정보
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  let where = {};

  const CATEGORY = {
    divCode: 'divCode',
    divComment: 'divComment',
  };

  if (category === CATEGORY.divCode) {
    where.divCode = { [Op.like]: '%' + searchWord + '%' };
  } else if (category === CATEGORY.divComment) {
    where.divComment = { [Op.like]: '%' + searchWord + '%' };
  } else {
    where[Op.and] = [];
    where[Op.and].push({
      [Op.or]: [
        { divCode: { [Op.like]: '%' + searchWord + '%' } },
        { divComment: { [Op.like]: '%' + searchWord + '%' } },
      ],
    });
  }

  let options = {
    where: where,
    include: [],
    attributes: {
      exclude: ['deletedAt'],
    },
    order: [['id', orderByQueryParam]],
    offset: pageNum * rowPerPage,
    limit: rowPerPage,
    distinct: true,
  };

  try {
    // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
    const { count: totalCount, rows: configs } = await models.Config.findAndCountAll(options);

    // 조회된 사용자 목록 응답
    _response.json({
      totalCount: totalCount,
      result: configs,
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
