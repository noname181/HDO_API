import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE, PERMISSIONS } from '../../../../middleware/newRole.middleware';
import { PERMISSION_NAME } from '../../../../util/permission.constraints';
import { remove } from '../../../../util/lodash';
import { transformResponse } from '../listRoles/listRoles';
import { USER_TYPE } from '../../../../util/tokenService';
const models = require('../../../../models');

export const readRoleById = {
  path: '/web/auth/roles/:id',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.list, PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request: Request, response: Response, next: NextFunction) {
  const { params, body } = request;

  const roleId = params.id.toString().trim() || '';
  const role = await models.Role.findByPk(roleId);

  if (!role) {
    return next('ROLE_IS_NOT_EXISTS');
  }
  const roleRes = transformResponse(role);

  return response.status(HTTP_STATUS_CODE.OK).json(roleRes);
}

function validator(request: Request, response: Response, next: NextFunction) {
  next();
}

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  if (error === 'ROLE_IS_NOT_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '역할이 존재하지 않습니다.',
    });
  }
  next();
}
