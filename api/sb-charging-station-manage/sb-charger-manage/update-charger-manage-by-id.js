/**
 * Created by Sarc Bae on 2023-06-07.
 * 충전기 수정 API
 */
'use strict';
const models = require('../../../models');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { Op } = require('sequelize');
const changeAvailability = require('../../../util/ocpp/changeAvailability');
const sendUnitPrice = require('../../../controllers/webAdminControllers/ocpp/sendUnitPrice');
const { USER_TYPE } = require('../../../util/tokenService');
const _ = require('lodash');

module.exports = {
  path: ['/chargers-manage/:chg_id', '/charging-stations-manage/:chargingStationId/chargers-manage/:chg_id'],
  method: 'put',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const chargingStationId = _request.params.chargingStationId;
  const chg_id = _request.params.chg_id;

  const body = await _request.body; // 수정될 충전기 정보
  if (body.chg_id) body.chg_id = undefined; // body에 id가 있으면 제거

  const userId = _request.user.id || _request.user.sub; // API 호출자의 user id
  body.updatedWho = userId;
  let ocpp_return = '';

  try {
    if (body.chg_charger_id) {
      const existCheck = await models.sb_charger.findOne({
        where: {
          chg_id: { [Op.ne]: chg_id },
          chg_charger_id: body.chg_charger_id,
        },
        attributes: {
          exclude: ['createdWho', 'updatedWho', 'deletedAt'],
        },
      });
      if (existCheck) throw 'CHARGER_ID_IS_EXIST';
    }

    // 해당 chg_id에 대한 충전기 정보 조회
    const charger = await models.sb_charger.findByPk(chg_id, {
      include: [
        { model: models.ChargerModel, as: 'chargerModel', attributes: ['modelCode', 'lastFirmwareVer'] },
        {
          model: models.sb_charging_station,
          as: 'chargingStation',
          paranoid: false,
          attributes: { exclude: ['createdWho', 'updatedWho'] },
          include: [
            {
              model: models.Org,
              as: 'org',
              paranoid: true,
              attributes: [ 
                'category', 
              ],
            }, 
          ],
        }],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });
    if (!charger) throw 'NOT_EXIST_CHARGER';

    // body에 chg_charger_id가 있다면 DB에 저장된 값과 일치할 경우에만 수정 허가
    if (body.chg_charger_id && body.chg_charger_id !== charger.chg_charger_id) throw 'MISMATCHED_CHARGER_ID';

    if (body.chg_unit_price != charger.chg_unit_price || body.upSetId != charger.upSetId) {
      //make cannot update if charger is using, not 'available'
      const { count: totalCountChannel, rows: allChannel } = await models.sb_charger_state.findAndCountAll({
        where: {
          chg_id,
        },
      });
      const countAllChannelAvailable = allChannel.filter((channel) => channel.cs_charging_state === 'available').length;

      if (totalCountChannel > 0 && totalCountChannel != countAllChannelAvailable) {
        // 2023.12.18
        // 충전기키 알고 있음.
        // 방금 실패했다는 사실을 알고 있음.
        // 단가변경 예약이 걸려야 하는 상황임.
        // DB에 데이터를 넣는데,
        // 필수정보 :
        // 충전기 아이디(chg_id)
        // 단가사용여부(usePreset)
        // 단가프리셋ID(upSetId - can be null if usePreset = 'N')
        // 고장단가(chg_unit_price - can be null if usePreset = 'Y')
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
        const createResult = await models.sb_unitprice_change_pending.create({
          chg_id: charger?.chg_id,
          usePreset: body?.usePreset,
          ucp_insert_dt: formattedDate,
          upSetId: body?.upSetId ?? null,
          chg_unit_price: body?.chg_unit_price
        })
        console.log("createResult", createResult)
        throw 'CHARGER_IS_USING_CANNOT_UPDATE';
      }
    }

    //Call OCPP
    // if (body.chg_use_yn && charger.chg_use_yn != body.chg_use_yn) {
    if (body.chg_use_yn && body.chg_use_yn === 'N') {
      const booking = await models.Booking.findOne({
        where: {
          chg_id,
          b_status: { [Op.in]: ['reserved', 'selected', 'charging'] },
        },
      });
      if (booking) throw 'CHARGER_IN_USE';
    }


    // 1. 1 station can have many chargers, and this chargers can have the same mid

    // 2. 2 station can have many chargers, but 2 different station can not have the same mid

    // 3. ev사업팀 can have many station, and this station can have the same mid
    if (body.mall_id) {
      let chargerWithMallID = await models.sb_charger.findOne({
        include: [ 
        {
          model: models.sb_charging_station,
          as: 'chargingStation',
          paranoid: false,
          attributes: { exclude: ['createdWho', 'updatedWho'] },
          include: [
            {
              model: models.Org,
              as: 'org',
              paranoid: true,
              attributes: [ 
                'category', 
              ],
            }, 
          ],
        }],
        where: {
          mall_id: body.mall_id,
          chgs_id: {
            [Op.ne]: charger.chgs_id,
          },
          chg_id: {
            [Op.ne]: chg_id,
          },
        },
      });
      if (chargerWithMallID && (charger.dataValues.chargingStation.org.category !== 'EV_DIV' || (charger.dataValues.chargingStation.org.category === 'EV_DIV' && charger.dataValues.chargingStation.org.category !== chargerWithMallID.dataValues.chargingStation.org.category))) {
        throw 'INVALID_MALL_ID';
      }
    }

    if (body.mall_id2) {
      let chargerWithMallID2 = await models.sb_charger.findOne({
        include: [ 
          {
            model: models.sb_charging_station,
            as: 'chargingStation',
            paranoid: false,
            attributes: { exclude: ['createdWho', 'updatedWho'] },
            include: [
              {
                model: models.Org,
                as: 'org',
                paranoid: true,
                attributes: [ 
                  'category', 
                ],
              }, 
            ],
          }],
        where: {
          mall_id2: body.mall_id2,
          chgs_id: {
            [Op.ne]: charger.chgs_id,
          },
          chg_id: {
            [Op.ne]: chg_id,
          },
        },
      });
      if (chargerWithMallID2 && (charger.dataValues.chargingStation.org.category !== 'EV_DIV' || (charger.dataValues.chargingStation.org.category === 'EV_DIV' && charger.dataValues.chargingStation.org.category !== chargerWithMallID2.dataValues.chargingStation.org.category))) {
        throw 'INVALID_MALL_ID';
      }
    }

    //   const type = body.chg_use_yn == 'N' ? '운영중지' : '운영';
    //   const ocppResult = await changeAvailability({ cid: chg_id, connectorId: 0, type: type });

    //   if (ocppResult['result'] == '000') {
    //     ocpp_return = ocppResult['msg'];
    //   } else if (ocppResult['result'] == '999') {
    //     ocpp_return = ocppResult['msg'];
    //   } else {
    //     ocpp_return = 'ERROR';
    //   }
    // }
    const _charger = _.cloneDeep(charger.dataValues);

    // 전달된 body로 업데이트
    await charger.update(body, {
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });

    //Update Unit price to used
    if (body.upSetId) {
      await models.UnitPriceSet.update(
        { isUsed: true },
        {
          where: {
            id: body.upSetId,
          },
        }
      );

      //Find and update unit price
      const foundUnitPrice = await models.sb_charger.findOne({
        where: {
          upSetId: charger.upSetId,
        },
      });

      if (!foundUnitPrice) {
        await models.UnitPriceSet.update(
          { isUsed: false },
          {
            where: {
              id: charger.upSetId,
            },
          }
        );
      }
    }

    //channel of changer
    const chargerModel = charger.chargerModel?.dataValues;
    let channel_data = { cs_model: chargerModel?.modelCode, cs_firmware: chargerModel?.lastFirmwareVer };
    // console.log('channel_data ----->', channel_data)
    await models.sb_charger_state.update(channel_data, {
      where: {
        chg_id: charger.chg_id,
      },
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });

    // if (body.charger_status) {
    //   await models.sb_charger.update(
    //     {
    //       charger_status: body.charger_status,
    //     },
    //     {
    //       where: {
    //         chg_id: chg_id,
    //       },
    //       attributes: {
    //         exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    //       },
    //       transaction: transaction,
    //     }
    //   );
    // }

    // 업데이트된 충전기 정보 새로고침
    const reloadCharger = await charger.reload({
      include: [
        { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
        { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      ],
      attributes: {
        exclude: ['createdWho', 'updatedWho', 'deletedAt'],
      },
    });

    let result_ocpp = '';
    //send unit price to machine (connect ocpp)
    if (body.chg_unit_price != _charger.chg_unit_price || body.upSetId != _charger.upSetId) {
      result_ocpp = await sendUnitPrice([_charger.chg_id]);
      console.log(11111111)
    }
    // 수정된 정보 응답
    _response.json({
      result: reloadCharger,
      ocpp: result_ocpp,
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

  if (_error === 'CHARGER_ID_IS_EXIST') {
    _response.error.badRequest(_error, '해당 chg_charger_id를 가진 충전기가 이미 존재합니다.');
    return;
  }

  if (_error === 'NOT_EXIST_CHARGER') {
    _response.error.notFound(_error, '해당 ID에 대한 충전기 정보가 존재하지 않습니다.');
    return;
  }

  if (_error === 'CHARGER_IS_USING_CANNOT_UPDATE') {
    _response.error.notFound(_error, '충전기가 사용중입니다. 이용가능 상태가 되면 변경한 단가가 적용됩니다.');
    return;
  }

  if (_error === 'MISMATCHED_CHARGER_ID') {
    _response.error.badRequest(_error, '수정하려는 충전기의 chg_charger_id가 일치하지 않습니다.');
    return;
  }

  if (_error === 'INVALID_MALL_ID') {
    _response.error.notFound(_error, '이미 다른 충전소에서 해당 MID를 사용하고 있습니다.');
    return;
  }

  if (_error === 'CHARGER_IN_USE') {
    _response.error.notFound(_error, '사용중일 때는 충전기를 수정할 수 없습니다.');
    return;
  }

  _response.error.unknown(_error.toString());
  next(_error);
}
