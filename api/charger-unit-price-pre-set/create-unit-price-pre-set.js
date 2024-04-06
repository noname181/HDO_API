/**
 * Created by inju on 2023-06-05.
 * 충전기 모델 insert
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/unit-price'],
  method: 'post',
  checkToken: true, // default true
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const headerData = _request.body.header;
  const detailData = _request.body.detail;

  headerData.updatedAt = new Date();
  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  headerData.createdWho = userId;
  headerData.updatedWho = userId;
  const transaction = await models.sequelize.transaction();
  try {
    let header;
    let existingHeader;
    if (headerData.headerId) {
      existingHeader = await models.UPSet.findOne({
        where: { id: headerData.headerId },
      });
    }

    if (existingHeader) {
      // UPSet 데이터 존재
      await models.UPSetDetail.destroy({
        where: {
          upSetId: headerData.headerId,
        },
        transaction: transaction,
      });

      header = await existingHeader.update(headerData, {
        transaction: transaction,
      });
    } else {
      // UPSet 데이터 존재하지 않는 경우
      header = await models.UPSet.create(headerData, {
        transaction: transaction,
      });
    }

    for (var i = 0; i < detailData.length; i++) {
      const getFromDate = new Date(detailData[i].details.fromDate);
      const getToDate = new Date(detailData[i].details.toDate);
      const getUpTimeTableId = detailData[i].details.upTimeTableId;
      const detail = {
        upTimeTableId: getUpTimeTableId,
        fromDate: getFromDate,
        toDate: getToDate,
        updatedAt: new Date(),
        createdWho: userId,
        updatedWho: userId,
        upSetId: header.id,
      };
      await models.UPSetDetail.create(detail, {
        transaction: transaction,
      });
    }
    const message = `저장이 성공적으로 완료되었습니다`;
    await transaction.commit();

    _response.json({
      status: '200',
      message: message,
    });
  } catch (e) {
    await transaction.rollback();
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(chgs_station_id, chgs_name)');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
