/**
 * Created by inju on 2023-07-05.
 * 업로드 파일 관리 insert
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/file-to-update',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.deletedAt = undefined;
  body.createdAt = undefined;
  try {
    body.updatedAt = new Date();

    const userId = _request.user.id || _request.user.sub;
    body.createdWho = userId;
    body.updatedWho = userId;
    body.division = body.division?.toUpperCase();

    if (body.newestVersion) {
      await models.FileToCharger.update(
        {
          newestVersion: false,
        },
        {
          where: {
            division: body.division,
          },
        }
      );
    }

    const fileToCharger = await models.FileToCharger.create(body);
    fileToCharger.save();

    const _fileToCharger = await fileToCharger.reload({
      include: [],
      attributes: {
        exclude: ['deletedAt'],
      },
    });

    _response.json(_fileToCharger);
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _requst, _response, next) {
  console.error(_error);
}
