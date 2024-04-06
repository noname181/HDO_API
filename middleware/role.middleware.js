const models = require('../models');

const USER_ROLE = {
  HDO: 'hdo',
  EXTERNAL: 'org',
  MOBILE: 'mobile',
  ALL: 'all',
};

const HTTP_STATUS_CODE = {
  OK: 200,
  NO_CONTENT: 204,
  CREATE: 201,
  UN_AUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  SERVICE_UN_AVAILABLE: 503,
};

class RoleMiddleware {
  checkRoles(roles) {
    return async (request, response, next) => {
      if (!roles || roles.length === 0 || roles.includes(USER_ROLE.ALL)) {
        return next();
      }
      const { user: userAuth } = request;
      if (!userAuth || !userAuth.id) {
        return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
          errorCode: 'FORBIDDEN_API',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: '해당 API는 현재 이용할 수 없습니다. API 상태 확인 또는 관리자에게 문의 주십시오.',
        });
      }

      const user = await models.UsersNew.findOne({
        where: {
          id: userAuth.id,
        },
      });

      if (!user) {
        return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
          errorCode: 'FORBIDDEN_API',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: '해당 API는 현재 이용할 수 없습니다. API 상태 확인 또는 관리자에게 문의 주십시오.',
        });
      }

      const userRole = Object.values(USER_ROLE).find((item) => {
        return user.type === item.toUpperCase();
      });

      if (!userRole || !roles.includes(userRole)) {
        return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
          errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: '사용자가 가지고 있는 권한 중 해당 기능의 허가가 되어있지 않습니다.',
        });
      }

      next();
    };
  }
}

module.exports = { RoleMiddleware, USER_ROLE, HTTP_STATUS_CODE };
