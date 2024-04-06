const { HTTP_STATUS_CODE } = require('./role.middleware');
const models = require('../models');
const { USER_STATUS } = require('../controllers/mobileControllers/auth/loginByAccountId/loginByAccountId');

class AuthMiddleware {
  tokenService;
  config;
  constructor(config, tokenService) {
    this.config = config;
    this.tokenService = tokenService;
  }

  checkToken(isCheckToken) {
    return async (request, response, next) => {
      const token = request.header('Authorization') || request.query.token;

      if (!token && isCheckToken) {
        return response.status(HTTP_STATUS_CODE.UN_AUTHORIZED).json({
          errorCode: 'UNAUTHORIZE_TOKEN_IS_REQUIRED',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: 'token is required',
        });
      }

      if (token) {
        const tokenParsed = this.parseToken(token);
        try {
          const payload = await this.tokenService.verifyToken(tokenParsed, this.config.jwtAccessTokenKey);

          const user = await models.UsersNew.findByPk(payload.id);

          if (!user || user.deletedAt || user.status !== USER_STATUS.active) {
            return response.status(HTTP_STATUS_CODE.UN_AUTHORIZED).json({
              errorCode: 'SLEEP_USER',
              timestamp: new Date().toISOString(),
              path: request.url,
              message: 'Token is expired',
            });
          }

          request.user = payload;
          return next();
        } catch (error) {
          if (error instanceof Error && error.message === 'TOKEN_IS_EXPIRED') {
            return response.status(HTTP_STATUS_CODE.UN_AUTHORIZED).json({
              errorCode: 'TOKEN_IS_EXPIRED',
              timestamp: new Date().toISOString(),
              path: request.url,
              message: 'Token is expired',
            });
          }

          return response.status(HTTP_STATUS_CODE.UN_AUTHORIZED).json({
            errorCode: 'TOKEN_IS_INVALID',
            timestamp: new Date().toISOString(),
            path: request.url,
            message: 'Token is invalid',
          });
        }
      }

      next();
    };
  }

  checkRefreshToken() {
    return async (request, response, next) => {
      const token = request.header('Authorization') || request.query.token;

      if (!token) {
        return response.status(HTTP_STATUS_CODE.UN_AUTHORIZED).json({
          errorCode: 'UNAUTHORIZE_TOKEN_IS_REQUIRED',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: 'token is required',
        });
      }

      const tokenParsed = this.parseToken(token);
      try {
        const payload = await this.tokenService.verifyToken(tokenParsed, this.config.jwtRefreshTokenKey);

        request.user = payload;
        return next();
      } catch (error) {
        if (error instanceof Error && error.message === 'TOKEN_IS_EXPIRED') {
          return response.status(HTTP_STATUS_CODE.UN_AUTHORIZED).json({
            errorCode: 'REFRESH_TOKEN_IS_EXPIRED',
            timestamp: new Date().toISOString(),
            path: request.url,
            message: 'Token is expired',
          });
        }

        return response.status(HTTP_STATUS_CODE.UN_AUTHORIZED).json({
          errorCode: 'TOKEN_IS_INVALID',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: 'Token is invalid',
        });
      }
    };
  }

  parseToken(token) {
    if (Array.isArray(token) && token.length > 1) {
      return token[0].toString();
    }

    return token.toString();
  }

  async checkRefreshTokenInDB(userId, token) {
    const user = await models.UsersNew.findOne({
      where: { id: userId },
    });

    return user && user.dataValues && user.dataValues.refreshToken && user.dataValues.refreshToken === token;
  }
}

module.exports = { AuthMiddleware };
