import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE, PERMISSIONS } from '../../../../middleware/newRole.middleware';
import { PERMISSION_NAME } from '../../../../util/permission.constraints';
import { remove } from '../../../../util/lodash';
import { idGenerator } from '../../../../util/idGenerator';
import { transformResponse } from '../listRoles/listRoles';
import { USER_TYPE } from '../../../../util/tokenService';
const models = require('../../../../models');

export const createRole = {
  path: '/web/auth/roles',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request: Request, response: Response, next: NextFunction) {
  const { user, body } = request;

  const hasRole = await models.Role.findOne({
    where: {
      name: body.name,
    },
  });

  if (hasRole) {
    return next('ROLE_NAME_IS_EXISTS');
  }

  const id = idGenerator();
  try {
    const role = await models.Role.create({
      id,
      name: body.name,
      mainMenu: body.mainMenu,
      listPermission: body.list,
      readPermission: body.read,
      writePermission: body.write,
      deletePermission: body.delete,
    });

    const roleRes = transformResponse(role);

    return response.status(HTTP_STATUS_CODE.OK).json(roleRes);
  } catch (error) {
    return next('ERROR_WHILE_CREATE');
  }
}

function validator(request: Request, response: Response, next: NextFunction) {
  const { body } = request;
  const permissions = Object.values(PERMISSION_NAME);

  if (!body || !body.name) {
    throw 'INPUT_INVALID';
  }

  const roleName = body.name.toString().trim().toUpperCase() || '';
  if (!roleName) {
    throw 'INVALID_ROLE_NAME';
  }

  let list: PERMISSION_NAME[] = [];
  if (body.list && Array.isArray(body.list)) {
    list = remove([...permissions], (item) => {
      return body.list.includes(item);
    });
  }

  let read: PERMISSION_NAME[] = [];
  if (body.read && Array.isArray(body.read)) {
    read = remove([...permissions], (item) => {
      return body.read.includes(item);
    });
  }

  let write: PERMISSION_NAME[] = [];
  if (body.write && Array.isArray(body.write)) {
    write = remove([...permissions], (item) => {
      return body.write.includes(item);
    });
  }

  let deletePermissions: PERMISSION_NAME[] = [];
  if (body.delete && Array.isArray(body.delete)) {
    deletePermissions = remove([...permissions], (item) => {
      return body.delete.includes(item);
    });
  }

  request.body = {
    ...request.body,
    name: roleName,
    list,
    read,
    write,
    delete: deletePermissions,
  };
  next();
}

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  if (error === 'INPUT_INVALID') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '유효하지 않은 결제입니다.',
    });
  }

  if (error === 'INVALID_ROLE_NAME') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '역할 이름이 잘못되었습니다.',
    });
  }

  if (error === 'ROLE_NAME_IS_EXISTS') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '역할 이름이 존재합니다.',
    });
  }

  if (error === 'ERROR_WHILE_CREATE') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '작성되지 않았습니다.',
    });
  }

  next();
}
