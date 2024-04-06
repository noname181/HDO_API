import { NextFunction, Request, Response } from 'express';
import { PERMISSION_NAME, PERMISSION_PAGE } from '../util/permission.constraints';
import { USER_TYPE } from '../util/tokenService';
const models = require('../models');

const USER_ROLE: { [key: string]: string } = {
  HDO: 'hdo',
  EXTERNAL: 'org',
  MOBILE: 'mobile',
  ALL: 'all',
};

export enum HTTP_STATUS_CODE {
  OK = 200,
  NO_CONTENT = 204,
  CREATE = 201,
  UN_AUTHORIZED = 401,
  FORBIDDEN = 403,
  CONFLICT = 409,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  SERVICE_UN_AVAILABLE = 503,
}

export enum PERMISSIONS {
  list = 'list',
  read = 'read',
  write = 'write',
  delete = 'delete',
}

export class NewRoleMiddleware {
  checkRoles(roles: USER_TYPE[] = [], permissions: PERMISSIONS[] = [], isCheckToken?: boolean) {
    return async (request: Request, response: Response, next: NextFunction) => {
      if (!isCheckToken || roles.length === 0) {
        request.privateView = true;
        return next();
      }

      const { user: authUser, headers, method } = request;

      if (!authUser) {
        return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
          errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: '사용자가 가지고 있는 권한 중 해당 기능의 허가가 되어있지 않습니다.',
        });
      }

      const checkMobileRole = roles.includes(USER_TYPE.MOBILE);
      const checkUserType = authUser.type.toUpperCase() === USER_TYPE.MOBILE.toUpperCase() && checkMobileRole;
      if (checkUserType) {
        request.privateView = true;
        return next();
      }

      const user = await models.UsersNew.findByPk(authUser.id, {
        include: [
          {
            model: models.Role,
          },
        ],
      });

      if (!user || !user.Role) {
        return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
          errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: '사용자가 가지고 있는 권한 중 해당 기능의 허가가 되어있지 않습니다.',
        });
      }

      const page = headers['location'] || '';

      const permissionPage = Object.entries(PERMISSION_PAGE).find(([key, value]) => value === page);
      const permissionPageKey = permissionPage ? permissionPage[0] : '';
      const permissionName = Object.entries(PERMISSION_NAME).find(([key, value]) => key === permissionPageKey);
      const permissionNameValue = permissionName ? permissionName[1] : '';

      const listRole = user.Role.listPermission
        ? user.Role.listPermission.some((item: string) => item === permissionNameValue)
        : false;
      const readRole = user.Role.readPermission
        ? user.Role.readPermission.some((item: string) => item === permissionNameValue)
        : false;
      const writeRole = user.Role.writePermission
        ? user.Role.writePermission.some((item: string) => item === permissionNameValue)
        : false;
      const deleteRole = user.Role.deletePermission
        ? user.Role.deletePermission.some((item: string) => item === permissionNameValue)
        : false;

      if (!listRole && !readRole && !writeRole && !deleteRole) {
        return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
          errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: '보기 페이지를 열람할 권한이 없습니다.',
        });
      }

      if (deleteRole) {
        request.privateView = true;
        return next();
      }

      if (method === 'DELETE') {
        return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
          errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: '사용자가 가지고 있는 권한 중 해당 기능의 허가가 되어있지 않습니다.',
        });
      }

      const writePermission = ['PUT', 'POST', 'PATCH'].includes(method);

      if (!writeRole && writePermission) {
        return response.status(HTTP_STATUS_CODE.FORBIDDEN).json({
          errorCode: 'NOT_FOUND_USER_PERMISSION_ON_ROLES',
          timestamp: new Date().toISOString(),
          path: request.url,
          message: '이 기능을 사용할 권한이 없습니다.',
        });
      }

      request.privateView = writeRole || readRole ? true : false;
      next();
    };
  }
}
