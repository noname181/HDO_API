/**
 * Created by inju on 2023-06-05.
 * 충전기 모델 insert
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/model-firmware',
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  body.id = undefined;

  const transaction = await models.sequelize.transaction();
  try {
    if (!body.modelId || !body.fwFileUrl) throw 'NO_REQUIRED_INPUT';
    if (!body.fwFileName) body.fwFileName = extractFileNameFromURL(body.fwFileUrl);
    if (!body.fwVer) body.fwVer = getCurrentDateTime();

    const foundChargerModel = await models.ChargerModel.findByPk(body.modelId);
    if (!foundChargerModel) throw 'NOT_EXIST_CHARGER_MODEL';
    body.updatedAt = new Date();

    const userId = _request.user.id || _request.user.sub || null;
    body.createdWho = userId;
    body.updatedWho = userId;

    if (body.isLast) {
      await models.ChargerModelFW.update(
        { isLast: false },
        {
          where: {
            modelId: body.modelId,
          },
          transaction,
        }
      );
    }

    //Update lastFirmwareVer charger model
    if (body.isLast) {
      await models.ChargerModel.update(
        {
          lastFirmwareVer: body.fwVer,
        },
        {
          where: {
            id: body.modelId,
          },
          transaction,
        }
      );
    }

    const chargerModelFw = await models.ChargerModelFW.create(body, {
      transaction,
    });

    await transaction.commit();
    // await transaction.rollback();

    _response.json({
      result: chargerModelFw,
    });
  } catch (e) {
    console.log(e);
    await transaction.rollback();
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NOT_EXIST_CHARGER_MODEL') {
    _response.error.notFound(_error, '존재하지 않는 충전기 모델입니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}

function extractFileNameFromURL(url) {
  const urlParts = url.split('/');
  const lastPathSegment = urlParts[urlParts.length - 1];

  // URL에서 쿼리 문자열 제거
  const queryStringIndex = lastPathSegment.indexOf('?');
  const cleanPathSegment = queryStringIndex !== -1 ? lastPathSegment.substring(0, queryStringIndex) : lastPathSegment;

  return cleanPathSegment;
}

function getCurrentDateTime() {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day}.${hours}.${minutes}`;
}
