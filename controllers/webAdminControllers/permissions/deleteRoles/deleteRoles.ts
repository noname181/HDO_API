import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE, PERMISSIONS } from '../../../../middleware/newRole.middleware';
import { PERMISSION_NAME } from '../../../../util/permission.constraints';
import { Op, Transaction } from 'sequelize';
import { USER_TYPE } from '../../../../util/tokenService';
import { LoggerService } from '../../../../services/loggerService/loggerService';
const models = require('../../../../models');

export const deleteRoles = {
  path: '/web/auth/roles',
  method: 'delete',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.delete],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request: Request, response: Response, next: NextFunction) {
  const loggerService = new LoggerService();
  const { query, user: authUser } = request;
  let ids: string[] = [];
  if (query.ids) {
    ids = query.ids
      .toString()
      .replace(/[\[\]\"\']/g, '')
      .split(',');
  }

  try {
    await models.sequelize.transaction(async (t: Transaction) => {
      await Promise.all(
        ids.map(async (item) => {
          const role = await models.Role.findOne({
            where: {
              id: item,
            },
            include: [
              {
                model: models.UsersNew,
                as: 'users',
                paranoid: false,
              },
            ],
            transaction: t,
            paranoid: false,
          });

          if (!role) {
            throw 'ROLE_ID_NOT_FOUND';
          }

          const checkDeleteRole = role.users ? role.users.some((item: any) => !item.deletedAt) : false;
          if (checkDeleteRole) {
            throw 'ROLE_IS_ACTIVE';
          }

          await role.destroy({ transaction: t }, { force: true });
        })
      );
    });

    return response.status(HTTP_STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    loggerService.error('Delete Roles by admin::', error);
    if (error instanceof Error) {
      next('ERROR_WHILE_DELETE');
    }
    next(error);
  }
}

function validator(request: Request, response: Response, next: NextFunction) {
  next();
}

function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  if (error === 'ROLE_ID_NOT_FOUND') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '역할을 찾을 수 없습니다.',
    });
  }

  if (error === 'ROLE_IS_ACTIVE') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '권한이 할당되어 있는 유저정보가 있습니다. 해당 권한을 삭제할수 없습니다.',
    });
  }

  if (error === 'ERROR_WHILE_DELETE') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '작성되지 않았습니다.',
    });
  }
  next();
}
