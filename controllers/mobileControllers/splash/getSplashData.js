const { transformUser } = require('../transformUser/transformUser');
const { USER_ROLE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { USER_TYPE } = require('../../../../util/tokenService');
const { responseFields } = require('../../../webAdminControllers/user/getUsers/getUsers');

const getMe = {
  path: '/mobile/splash',
  method: 'get',
  checkToken: true,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

/*
* 앱에서 필요한 정보
* 초기 설치 & 자동로그인 미설정
- version check - Settings에 있는 버전
- dynamic link - 관리자페이지에서 스트링으로 링크를 집어넣고, 그거를 뿌려주기만 하면되는데, ios, android 둘다 OS를 찾아서 가게 해주는 링크임.
- title (알림 제목)
- body (알림 내용)
- 강제 업데이트 실행여부 (admin check box : bool)
*
* 충전중이라면 충전과 관련된 정보
* chg_id, conn_id, user_id

자동로그인 설정(token check)
- version check
- dynamic link
- title (알림 제목)
- body (알림 내용)
- 강제 업데이트 (admin check box : bool)
- 충전중인 상태 확인
*
* */

async function service(request, response, next) {
  // version, advertiment etc
  // Use AppConfig model
  response.json({result:1})
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'USER_IS_NOT_FOUND') {
    return response.error.notFound(error, '해당 회원의 데이터가 존재하지 않습니다.');
  }

  next();
}

module.exports = { getMe };
