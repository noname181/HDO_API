const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');

const updateScript = {
  path: '/web/cs-script/:id',
  method: 'put',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.write],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { params, body } = request;
  const id = params.id;
  const { scriptName, scrptContent, updatedWho } = body;

  try {
    const updateScriptInput = {
      scrptContent,
      updatedWho,
    };

    const createScriptInput = {
      scriptName,
      scrptContent,
      createdWho: updatedWho,
      updatedWho,
    };

    let updateCount = await models.CsScript.update(
      updateScriptInput,
      {
        where: {
          id,
        },
      },
    );

    if (updateCount === 0) {
      await models.CsScript.create(createScriptInput);
      updateCount = 1;
    }
    response.status(HTTP_STATUS_CODE.OK).json(updateCount);
  } catch (error) {
    console.error('updateScript::service::', error);
    next(error);
  }
}

function validator(request, response, next) {
  const { body } = request;

  if (!body || !body.scrptContent || !body.updatedWho) {
    throw 'NO_REQUIRED_INPUT';
  }
  next();
}

function errorHandler(error, request, response, next) {
  console.log('error::', error);
  if (error === 'NO_REQUIRED_INPUT') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '필수 입력 정보가 누락되었습니다.',
    });
  }
  next();
}

module.exports = { updateScript };
