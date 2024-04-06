/**
 * Created by Inju on 2023-06-20.
 * 타임 테이블 등록
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: ['/create-unit-price-table'],
  method: 'POST',
  checkToken: false,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const body = _request.body;
  const headerData = body[0].addRowHeaderDataKey;
  const detailData1 = body[0].tpgrid1OrgDataKey;
  const detailData2 = body[0].tpgrid2OrgDataKey;

  const transaction = await models.sequelize.transaction();
  try {
    // headerData insert 준비
    headerData.updatedAt = new Date(); // updatedAt의 default 값을 sequelize에서 데이터 생성시 호출하지 못하여 수동으로 추가

    const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
    headerData.createdWho = userId;
    headerData.updatedWho = userId;

    let header;

    // header 데이터 먼저 조회
    header = await models.UPTimeTable.findByPk(headerData.id);

    // 없는경우
    if (!header) {
      // header 데이터 insert
      header = await models.UPTimeTable.create(headerData, {
        transaction,
      });
      // detail 데이터 insert
      for (let i = 0; i < 12; i++) {
        const detail1 = {
          ...detailData1[i],
          updatedAt: new Date(),
          createdWho: userId,
          updatedWho: userId,
          upTimeTableId: header.id,
        };
        await models.UPTimeTableDetail.create(detail1, {
          transaction,
        });
      }
      // detail 데이터 insert
      for (let i = 0; i < 12; i++) {
        const detail2 = {
          ...detailData2[i],
          updatedAt: new Date(),
          createdWho: userId,
          updatedWho: userId,
          upTimeTableId: header.id,
        };
        await models.UPTimeTableDetail.create(detail2, {
          transaction,
        });
      }
      // header 데이터 있는 경우
    } else {
      // header 데이터 업데이트
      await models.UPTimeTable.update(
        {
          useYN: headerData.useYn,
          desc: headerData.desc,
        },
        {
          where: { id: header.id },
          transaction,
        }
      );
      // detail 데이터 삭제
      const delete1 = await models.UPTimeTableDetail.destroy({
        where: { upTimeTableId: header.id },
        transaction,
      });
      // detail 데이터 insert
      for (let i = 0; i < 12; i++) {
        if (detailData1[i].id) detailData1[i].id = undefined;
        const detail1 = {
          ...detailData1[i],
          updatedAt: new Date(),
          createdWho: userId,
          updatedWho: userId,
          upTimeTableId: header.id,
        };
        await models.UPTimeTableDetail.create(detail1, {
          transaction,
        });
      }
      // detail 데이터 insert
      for (let i = 0; i < 12; i++) {
        if (detailData2[i].id) detailData2[i].id = undefined;
        const detail2 = {
          ...detailData2[i],
          updatedAt: new Date(),
          createdWho: userId,
          updatedWho: userId,
          upTimeTableId: header.id,
        };
        await models.UPTimeTableDetail.create(detail2, {
          transaction,
        });
      }
    }
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    next(e);
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
