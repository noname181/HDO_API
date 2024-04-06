/**
 * Created by SeJin Kim on 2023-08-29
 * Retrieve the Unit Price List
 * 단가 목록을 조회한다
 */
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/unit-price-management'],
  method: 'get',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  // const pageNum = _request.query.page ? parseInt(_request.query.page) : 0;
  // const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const title = _request.body.title || null;
  const useYN = _request.body.useYN || null; // When requesting a useYN column at the front-end, it must be string type ( "1", "0")

  const where = {};

  if (title) {
    where['title'] = title;
  }

  if (useYN) {
    where['useYN'] = useYN;
  }

  try {
    const result = await models.UnitPrice.findAll({
      where,
    });

    _response.json({
      totalCount: result.length,
      result,
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

  // if (_error === 'UNEXPRECTED_USER_REQUESTED') {
  //     _response.error.badRequest(_error, '존재하지 않는 사용자를 요청했습니다.');
  //     return;
  // }

  _response.error.unknown(_error.toString());
  next(_error);
}
