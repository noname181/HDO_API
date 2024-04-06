/**
 * Created by Sarc Bae on 2023-06-07.
 * 충전소 수정 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService'); 
const sequelize = require('sequelize');
module.exports = {
  path: '/charging-stations-manage/:chgs_id',
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chgs_id = _request.params.chgs_id;
  const body = await _request.body; // 수정될 충전소 정보
  if (body.chgs_id) body.chgs_id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;

  // body 전처리
  // if (body.chgs_station_id) {
  //   // station id에서 - 제외하고 저장
  //   body.chgs_station_id = body.chgs_station_id.replace(/-/g, '') + '';
  // }

  try {
    if (body.chgs_station_id && !body.ev_div) {
      const existCheck = await models.sb_charging_station.findOne({
        where: {
          chgs_id: { [Op.ne]: chgs_id },
          chgs_station_id: body.chgs_station_id,
        },
        attributes: {
          exclude: ['createdWho', 'updatedWho', 'deletedAt'],
        },
      });
      if (existCheck) throw 'STATION_ID_IS_EXIST';
    }

    // 소속 변경시 chgs_car_wash 분기처리
    // if (body.orgId) {
    //   // 해당 소속 정보 조회
    //   const org = await models.Org.findByPk(body.orgId);
    //   if (!org) throw 'NOT_EXIST_ORG';

    //   // wash startTime과 endTime이 둘다 들어와야 wash yn Y로 설정. 다만 등록시 N으로도 설정 가능
    //   if (org.haveCarWash === 'N' && (body.chgs_car_wash_yn === 'Y' || body.chgs_car_wash_yn === 'y')) {
    //     body.chgs_car_wash_yn = 'N';
    //     delete body.washStartTime;
    //     delete body.washEndTime;
    //   } else if (body.chgs_car_wash_yn === 'Y' || body.chgs_car_wash_yn === 'y') {
    //     body.chgs_car_wash_yn = 'Y';
    //   } else {
    //     body.chgs_car_wash_yn = 'N';
    //   }
    // }

    // 해당 chgs_id에 대한 충전소 정보 조회
    const chargingStation = await models.sb_charging_station.findByPk(chgs_id, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    if (!chargingStation) throw 'NOT_EXIST_CHARGING_STATION';

    // if (body.chgs_car_wash_yn ? (body.chgs_car_wash_yn.toUpperCase() === 'Y' ? true : false) : false) {
    //   // body.chgs_car_wash_yn을 Y로 변경시 소속된 소속에서 정보 확인

    //   const _orgId = body.orgId ? body.orgId : chargingStation.orgId;

    //   const _org = await models.Org.findByPk(_orgId);
    //   if (!_org) throw 'NOT_EXIST_ORG';

    //   if (_org.haveCarWash === 'N') {
    //     body.chgs_car_wash_yn = 'N';
    //     delete body.washStartTime;
    //     delete body.washEndTime;
    //   }
    // }

    if (body.priceType && body.priceType === 'table') {
      body.fixedPrice = null;
    }

    //Update Org
    if (body.address || body.area || body.branch || body.erp) {
      const org_ = await models.Org.findByPk(chargingStation.dataValues.orgId);
      if (!org_) throw 'NOT_EXIST_ORG';

      const payload = {
        address: body.address || org_.address,
        area: body.area !== '' ? body.area : org_.area,
        branch: body.branch !== '' ? body.branch : org_.branch,
        erp: body.erp || org_.erp,
        haveCarWash: body.haveCarWash || org_.haveCarWash,
        region: body.region || org_.region,
      };

      await org_.update(payload, {
        attributes: {
          exclude: ['deletedAt'],
        },
      });

      body.orgId = org_.dataValues.id;
    }

    if (!body.coordinate || !body.coordinate.latitude || !body.coordinate.longitude) {
      throw 'COORDINATE_IS_REQUIRE';
    }
   
   
    // 전달된 body로 업데이트
    await chargingStation.update(body, {
      attributes: {
        exclude: ['deletedAt'],
      },
    });
    await models.sequelize.query(`  
    UPDATE sb_charging_stations SET coordinate = ST_GEOMFROMTEXT(CONCAT('POINT(', ${body.coordinate.longitude}, ' ', ${body.coordinate.latitude}, ')')) WHERE chgs_id = ${chgs_id} 
   `,
     {
       type: sequelize.QueryTypes.UPDATE,
     }
   ); 
    //Update Unit price to used
    if (body.unitPriceSetId) {
      await models.UnitPriceSet.update(
        { isUsed: true },
        {
          where: {
            id: body.unitPriceSetId,
          },
        }
      );

      //Find and update unit price
      const foundUnitPrice = await models.sb_charging_station.findOne({
        where: {
          unitPriceSetId: chargingStation.unitPriceSetId,
        },
      });

      if (!foundUnitPrice) {
        await models.UnitPriceSet.update(
          { isUsed: false },
          {
            where: {
              id: chargingStation.unitPriceSetId,
            },
          }
        );
      }
    }

    // 업데이트된 충전소 정보 새로고침
    const reloadChargingStation = await chargingStation.reload({
      include: [
        {
          model: models.sb_charger,
          as: 'chargers',
          attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
        },
        {
          model: models.Org,
          as: 'org',
          attributes: { exclude: ['createdWho', 'updatedWho', 'deletedAt'] },
        },
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });

    // 수정된 정보 응답
    _response.json({
      result: reloadChargingStation, 
    });
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  if (_error === 'STATION_ID_IS_EXIST') {
    _response.error.badRequest(_error, '해당 chgs_station_id를 가진 충전소가 이미 존재합니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGING_STATION') {
    _response.error.notFound(_error, '해당 ID에 대한 충전소 정보가 존재하지 않습니다.');
    return;
  }

  if (_error === 'NOT_EXIST_ORG') {
    _response.error.notFound(_error, '해당 ID에 대한 소속이 존재하지 않습니다.');
    return;
  }

  if (_error === 'COORDINATE_IS_REQUIRE') {
    _response.error.badRequest(_error, '정확한 주소 좌표를 설정하기위해서는 주소를 다시 한번 검색해주세요');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
