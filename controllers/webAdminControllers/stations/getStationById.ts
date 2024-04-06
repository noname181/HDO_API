import moment from 'moment-timezone';
import { Request, Response } from 'express';
import { USER_TYPE } from '../../../util/tokenService';
import { HTTP_STATUS_CODE } from '../../../middleware/newRole.middleware';
import { NotFoundStationException } from '../../../exceptions/notFound/notFoundStation.exception';
import { cloneDeep } from '../../../util/lodash';
import { getGeoCodeFromAddress } from '../../../services/naverServices/naverMap.service';
import { ConflictException } from '../../../exceptions/conflict.exception';
const models = require('../../../models');

export const getStationById = {
  path: '/admin/stations/:id',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  logDisable: false,
  service: service,
};

async function service(request: Request, response: Response) {
  const { params, user: authUser } = request;
  const id = params.id ? Number(params.id) : 0;
  const nowHour = moment().tz('Asia/Seoul').hours();

  const station = await models.sb_charging_station.findByPk(id, {
    include: [
      {
        model: models.sb_charger,
        as: 'chargers',
        attributes: { exclude: ['createdWho', 'updatedWho'] },
        include: [
          {
            model: models.sb_charger_state,
            as: 'chargerStates',
            attributes: {
              exclude: ['createdWho', 'updatedWho', 'deletedAt'],
            },
            order: [['createdAt', 'DESC']],
          },
          {
            model: models.ChargerModel,
            as: 'chargerModel',
            required: false,
            attributes: {
              exclude: ['deletedAt', 'createdWho', 'updatedWho'],
            },
          },
          {
            model: models.UnitPriceSet,
            as: 'UnitPriceSet',
            attributes: [[`unitPrice${nowHour + 1}`, 'unitPrice']],
          },
        ],
      },
      {
        model: models.Org,
        as: 'org',
        attributes: [
          'id',
          'category',
          'fullname',
          'name',
          'bizRegNo',
          'address',
          'contactName',
          'contactPhoneNo',
          'contactEmail',
          'deductType',
          'discountPrice',
          'staticUnitPrice',
          'payMethodId',
          'isPayLater',
          'isLocked',
          'billingDate',
          'closed',
          'area',
          'region',
          'branch',
          'haveCarWash',
          'haveCVS',
          'STN_STN_SEQ',
          'STN_STN_ID',
          'STN_STN_GUBUN',
          'STN_CUST_NO',
          'STN_ASSGN_AREA_GUBUN',
          'STN_COST_CT',
          'STN_PAL_CT',
          'STN_STN_SHORT_NM',
          'erp',
          'createdAt',
          'updatedAt',
          [
            models.sequelize.literal(
              `(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`
            ),
            'branchName',
          ],
          [
            models.sequelize.literal(
              "(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)"
            ),
            'areaName',
          ],
        ],
      },
      { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
      { model: models.UsersNew, as: 'operatorManager', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
  });
  if (!station) {
    throw new NotFoundStationException();
  }
  const isFavorite = await models.FavoriteChargerStation.findOne({
    where: {
      chargerId: station.chgs_id,
      userId: authUser.id,
    },
  });

  //Get minimum unit price
  let { chargers } = station;
  let unitPrice;
  if (chargers) {
    chargers = chargers.map((chg: any) => {
      if (!chg.chg_unit_price) {
        chg.chg_unit_price = chg.UnitPriceSet?.dataValues?.unitPrice;
      }
      return chg;
    });
    chargers.sort((a: any, b: any) => a.chg_unit_price - b.chg_unit_price);
    unitPrice = getUnitPrice(chargers);
  }

  let maxKw = 0;
  let pncAvailable = false;
  station.chargers?.map((item: any) => {
    if (item?.dataValues?.chargerModel?.maxKw && item?.dataValues?.chargerModel?.maxKw > maxKw)
      maxKw = item.chargerModel.maxKw;
    if (item?.dataValues?.chargerModel?.pncAvailable) pncAvailable = true;
  });

  // const coordinate = station.org?.address ? await getGeoCodeFromAddress(station.org.address) : station.coordinate;
  const coordinate = station.coordinate;
  
  const result = {
    coordinate,
    chgs_id: station.chgs_id,
    chgs_station_id: station.chgs_station_id,
    status: station.status,
    chgs_name: station.chgs_name,
    chrgStartTime: station.chrgStartTime,
    chrgEndTime: station.chrgEndTime,
    washStartTime: station.washStartTime,
    washEndTime: station.washEndTime,
    chgs_kepco_meter_no: station.chgs_kepco_meter_no,
    isUse: station.isUse,
    chgs_car_wash_yn: station.chgs_car_wash_yn,
    chgs_aff_only: station.chgs_aff_only,
    chgs_field_desc: station.chgs_field_desc,
    area_code_id: station.area_code_id,
    createdAt: station.createdAt,
    updatedAt: station.updatedAt,
    orgId: station.orgId,
    chgs_operator_manager_id: station.chgs_operator_manager_id,
    chargers: station.chargers,
    org: station.org,
    createdBy: station.createdBy,
    updatedBy: station.updatedBy,
    operatorManager: station.operatorManager,
    isFavorite: isFavorite ? true : false,
    unitPrice: unitPrice,
    activeStationYN: station.activeStationYN,
    maxKw,
    pncAvailable,
    region: station.region,
  };

  return response.status(HTTP_STATUS_CODE.OK).json({ result });
}

function getUnitPrice(chargers: any) {
  let unitPrice;
  for (const chg of chargers) {
    if (chg.chg_unit_price) {
      unitPrice = chg.chg_unit_price;
      break;
    }
  }
  return unitPrice;
}
