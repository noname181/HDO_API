const Sequelize = require('sequelize');
const { HTTP_STATUS_CODE, USER_ROLE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { PERMISSION_NAME } = require('../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../middleware/newRole.middleware');

const deleteMultiUsers = {
  path: '/web/users',
  method: 'delete',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.delete],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { ids } = request.body;

  try {
    for (const id of ids) {
      const user = await models.UsersNew.findByPk(id.toString());
      if (!user) {
        return next('INVALID_ID');
      }
    }

    await models.UsersNew.update(
      { status: 'SLEEP', deletedAt: new Date(), roleId: null, dupinfo: null },
      {
        where: {
          id: {
            [Sequelize.Op.in]: ids,
          },
        },
      }
    );
   
    await models.UserOauth.destroy({
      where: {
        usersNewId: {
          [Sequelize.Op.in]: ids,
        },
      },
      force: true,
    }); 
    
    return response.status(HTTP_STATUS_CODE.OK).json({ success: 'success' });
  } catch (error) {
    return next('ERROR_UPDATE');
  }
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'INVALID_ID') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '잘못된 아이디.',
    });
  }

  if (error === 'ERROR_UPDATE') {
    return response.status(HTTP_STATUS_CODE.CONFLICT).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '사용자를 업데이트하는 중에 오류가 발생했습니다.',
    });
  }
  next();
}

module.exports = { deleteMultiUsers };
