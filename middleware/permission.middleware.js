const models = require('../models');
const { HTTP_STATUS_CODE } = require('./role.middleware');

const PERMISSION = {
  admin: 'ADMIN',
  viewer: 'VIEWER',
};

const permissionMiddleware = (permissions) => {
  return async (request, response, next) => {
    if (!permissions) {
      next();
    }

    const { user: userAuth } = request;
    const userId = userAuth.id || '';
    const user = await models.UsersNew.findByPk(userId);
    if (!userAuth || !userId || !user) {
      return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
        errorCode: 'FORBIDDEN_API',
        timestamp: new Date().toISOString(),
        path: request.url,
        message: '해당 API는 현재 이용할 수 없습니다. API 상태 확인 또는 관리자에게 문의 주십시오.',
      });
    }

    if (!permissions.includes(user.role)) {
      return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
        errorCode: 'FORBIDDEN_API',
        timestamp: new Date().toISOString(),
        path: request.url,
        message: '사용자가 가지고 있는 권한 중 해당 기능의 허가가 되어있지 않습니다.',
      });
    }

    next();
  };
};

module.exports = { permissionMiddleware, PERMISSION };
