/**
 * Created by Sarc Bae on 2023-0607.
 * 충전소 등록 API
 */
'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { Op } = require('sequelize');
const { USER_TYPE } = require('../../util/tokenService');

module.exports = {
  path: '/charging-stations-manage',
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
  body.updatedAt = new Date(); // updatedAt의 default 값을 sequelize에서 데이터 생성시 호출하지 못하여 수동으로 추가

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.createdWho = userId;
  body.updatedWho = userId;

  // pk는 자동생성이므로, body에 pk가 전달되는 경우 제거
  if (body.chgs_id) body.chgs_id = undefined;

  const transaction = await models.sequelize.transaction();

  try {
    // 필수값 정의(자동으로 만들어지는 pk 제외)
    if (!body.chgs_station_id || !body.chgs_name) throw 'NO_REQUIRED_INPUT';

    if (body.orgId && body.orgId != '') {
      // 해당 소속 정보 조회
      const org = await models.Org.findByPk(body.orgId);
      if (!org) throw 'NOT_EXIST_ORG';

      // wash startTime과 endTime이 둘다 들어와야 wash yn Y로 설정. 다만 등록시 N으로도 설정 가능
      // if (org.haveCarWash === 'N' && (body.chgs_car_wash_yn === 'Y' || body.chgs_car_wash_yn === 'y')) {
      //   body.chgs_car_wash_yn = 'N';
      //   delete body.washStartTime;
      //   delete body.washEndTime;
      // } else if (
      //   (body.chgs_car_wash_yn === 'Y' || body.chgs_car_wash_yn === 'y') &&
      //   body.washStartTime &&
      //   body.washEndTime
      // ) {
      //   body.chgs_car_wash_yn = 'Y';
      // } else {
      //   body.chgs_car_wash_yn = 'N';
      // }
    }
    let where = {};
    if (where[Op.or] === undefined) where[Op.or] = [];
    if (body.chgs_station_id) {
      where[Op.or].push({
        chgs_station_id: body.chgs_station_id,
      });
    }
    if (body.orgId) {
      where[Op.or].push({
        orgId: body.orgId,
      });
    }
      const existCheck = await models.sb_charging_station.findOne({
        where: where,
        attributes: {
          exclude: ['createdWho', 'updatedWho', 'deletedAt'],
        },
      });
      if (existCheck) throw 'STATION_ID_IS_EXIST';
     

    // Check org = EV사업부
    if (body.ev_div) {
      const payload = {
        address: body.address,
        area: body.area,
        category: 'EV_DIV',
        branch: body.branch,
        name: body.category,
        fullname: body.category,
        erp: body.erp,
        haveCarWash: body.haveCarWash,
        region: body.region
      };

      const org = await models.Org.create(payload);

      body.orgId = org.dataValues.id;
    }

    //Update erp
    if (!body.ev_div && body.erp && body.orgId) {
      await models.Org.update(
        { erp: body.erp },
        {
          where: { id: body.orgId },
        },
        {
          transaction: transaction,
        }
      );
    }

    // 전달된 충전소 정보를 데이터 베이스에 추가
    const chargingStation = await models.sb_charging_station.create(body, {
      transaction: transaction,
    });

    // 생성된 충전소의 pk로 조회하여 잘 생성되었는지 확인(pk 키 확인 중요!)
    const createdChargingStation = await models.sb_charging_station.findByPk(chargingStation.chgs_id, {
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

    await transaction.commit();

    // 조회된 결과 반환
    _response.json({
      result: createdChargingStation,
    });
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

  if (_error === 'STATION_ID_IS_EXIST') {
    _response.error.badRequest(_error, '해당 chgs_station_id를 가진 충전소가 이미 존재합니다.');
    return;
  }

  if (_error === 'NO_REQUIRED_INPUT') {
    _response.error.notFound(_error, '필수 입력 정보가 누락되었습니다.(chgs_station_id, chgs_name)');
    return;
  }

  if (_error === 'NOT_EXIST_ORG') {
    _response.error.notFound(_error, '해당 ID에 대한 소속이 존재하지 않습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
