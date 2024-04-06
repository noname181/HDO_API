import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE, PERMISSIONS } from '../../../../middleware/newRole.middleware';
import { PERMISSION_NAME } from '../../../../util/permission.constraints';
import { remove } from '../../../../util/lodash';
import { transformResponse } from '../listRoles/listRoles';
import { USER_TYPE } from '../../../../util/tokenService';
const models = require('../../../../models');

export const updateRoleById = {
  path: '/web/auth/roles/:id',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.write],
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

  try {
    await models.Role.update(
      {
        listPermission: body.list,
        readPermission: body.read,
        writePermission: body.write,
        deletePermission: body.delete,
        mainMenu: body.mainMenu,
      },
      {
        where: {
          id: role.id,
        },
      }
    );

    const roleUpdated = await role.reload();
    const roleRes = transformResponse(roleUpdated);

    return response.status(HTTP_STATUS_CODE.OK).json(roleRes);
  } catch (error) {
    return next('ERROR_WHILE_UPDATE');
  }
}

function validator(request: Request, response: Response, next: NextFunction) {
  const { body } = request;
  const permissions = Object.values(PERMISSION_NAME);

  if (body && body.list && Array.isArray(body.list)) {
    const list = remove([...permissions], (item) => {
      return body.list.includes(item);
    });
    request.body = {
      ...body,
      list,
    };
  }

  if (body && body.read && Array.isArray(body.read)) {
    const read = remove([...permissions], (item) => {
      return body.read.includes(item);
    });
    request.body = {
      ...body,
      read,
    };
  }

  if (body && body.write && Array.isArray(body.write)) {
    const write = remove([...permissions], (item) => {
      return body.write.includes(item);
    });
    request.body = {
      ...body,
      write,
    };
  }

  if (body && body.delete && Array.isArray(body.delete)) {
    const deletePermissions = remove([...permissions], (item) => {
      return body.delete.includes(item);
    });
    request.body = {
      ...body,
      delete: deletePermissions,
    };
  }
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

  if (error === 'ERROR_WHILE_UPDATE') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '역할이 존재하지 않습니다.',
    });
  }
  next();
}
