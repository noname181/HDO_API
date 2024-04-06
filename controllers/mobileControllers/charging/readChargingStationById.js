const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');

const readChargingStationById = {
  path: '/charge-stations/:id',
  method: 'get',
  checkToken: true, // default true
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const { params, query, user } = request;
  const chgs_id = parseInt(params['id']) || 0;
  const provider = query['provider'] || 'HDO';

  if (!chgs_id) {
    return next('CHARGE_ID_MUST_DEFINE');
  }

  const chargingStationDB = await models.sb_charging_station.findByPk(chgs_id, {
    include: [
      {
        model: models.Org,
        as: 'org',
      },
      {
        model: models.sb_charger,
        as: 'chargers',
      },
    ],
  });

  if (!chargingStationDB || !chargingStationDB.dataValues) {
    return next('NOT_FOUND_CHARGE');
  }

  const chargingStation = chargingStationDB.dataValues;

  if (chargingStation.isUse === 'N') {
    return next('CHARGE_NOT_USED');
  }

  const availCnt = await availableChargeCount(chargingStation.chgs_id);

  let isFavorite = false;
  if (user && user.id) {
    isFavorite = await findIsFavoriteChargeStation(user.id, chargingStation.chgs_id);
  }

  const maxKw = await getStationMaxPower(chargingStation.chgs_id);

  const SPEED_TYPE_SLOWEST = '4';
  const hyperCnt = await hyperChargerCounter(chargingStation.chgs_id, SPEED_TYPE_SLOWEST);
  const lowCnt = await slowChargerCounter(chargingStation.chgs_id, SPEED_TYPE_SLOWEST);
  const pncCnt = await pncChargerStationCounter(chargingStation.chgs_id);
  const DIV_CODE = 'MEMBER_DISC';
  const dcMobilePrice = await getDivCodePrice(DIV_CODE);
  const unitPrice = await getUnitPriceCharger(chargingStation.chgs_id);

  const result = {
    chgs_id: chargingStation.chgs_id,
    chgs_name: chargingStation.chgs_name,
    coordinate: {
      longitude: chargingStation.coordinate['x'],
      latitude: chargingStation.coordinate['y'],
    },
    chrgStartTime: chargingStation.chrgStartTime,
    chrgEndTime: chargingStation.chrgEndTime,
    chgs_field_desc: chargingStation.chgs_field_desc || '', // TODO 추후 충전소 관련 추가정보 필요
    address: chargingStation.org.address || '',
    isFavorite,
    washable: checkWashTime({
      washStartTime: chargingStation.washStartTime,
      washEndTime: chargingStation.washEndTime,
      chgs_car_wash_yn: chargingStation.chgs_car_wash_yn,
    }),
    chargeable: checkChargable({
      chrgStartTime: chargingStation.chrgStartTime,
      chrgEndTime: chargingStation.chrgEndTime,
      availCnt,
    }),
    maxKw,
    hyperCnt,
    lowCnt,
    pncCnt,
    unitPrice,
    member_unitPrice: Math.abs(unitPrice - dcMobilePrice),
    // TODO mysql Proc_Get_Charging_Station_Detail_M not define for this field
    shareInfo: '',
    // TODO Old api define that
    phoneNo: '',
  };

  return response.status(HTTP_STATUS_CODE.OK).json(result);
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  if (error === 'CHARGE_ID_MUST_DEFINE') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Charge id must define',
    });
  }

  if (error === 'NOT_FOUND_CHARGE') {
    return response.status(HTTP_STATUS_CODE.NOT_FOUND).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Charge is not found',
    });
  }

  if (error === 'CHARGE_NOT_USED') {
    return response.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      errorCode: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Charge is not used right now',
    });
  }

  next();
}

function checkWashTime({ washStartTime, washEndTime, chgs_car_wash_yn }) {
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  if (chgs_car_wash_yn === 'N') {
    return false;
  }
  if (chgs_car_wash_yn === 'Y' && currentTime >= washStartTime && currentTime <= washEndTime) {
    return true;
  }
  return false;
}

function checkChargable({ chrgStartTime, chrgEndTime, availCnt }) {
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  if (availCnt > 0 && currentTime >= chrgStartTime && currentTime <= chrgEndTime) {
    return true;
  }
  return false;
}

// * instead subQuery in Proc_Get_Charging_Station_Detail_M
async function availableChargeCount(chgs_id) {
  // TODO shouldn't hard code
  const AVAILABLE_CHARGE_STATE = 2;
  const availableChargeCount = await models.sb_charger.count({
    include: [
      {
        model: models.sb_charger_state,
        as: 'chargerStates',
        attributes: [],
        where: {
          cs_charger_state: AVAILABLE_CHARGE_STATE,
        },
      },
    ],
    group: 'chgs_id',
    having: {
      chgs_id,
    },
  });

  return availableChargeCount && availableChargeCount.length ? availableChargeCount[0].count : 0;
}

// * find charge station was favorite by user
async function findIsFavoriteChargeStation(userId, chargingStationId) {
  const favorite = await models.FavoriteChargerStation.findOne({
    where: {
      [Op.and]: [
        {
          userId,
        },
        {
          chargerId: chargingStationId,
        },
      ],
    },
  });
  return Boolean(favorite) || false;
}

// * instead for mysql func Fn_Get_Station_MaxPower
async function getStationMaxPower(chargingStationId) {
  const maxKw = await models.ChargerModel.max('maxKw', {
    include: [
      {
        model: models.sb_charger,
        as: 'chargers',
      },
    ],
    group: ['id'],
    having: {
      id: chargingStationId,
    },
  });

  return maxKw || 0;
}

// * instead for mysql func Fn_Get_ChargerCnt_Hyper
async function hyperChargerCounter(chargingStationId, speedTypeSlowest) {
  const hyperCntGet = await models.ChargerModel.count({
    include: [
      {
        model: models.sb_charger,
        as: 'chargers',
        attributes: [],
        where: {
          chgs_id: chargingStationId,
        },
      },
    ],
    group: ['id', 'speedType'],
    having: models.sequelize.where(models.sequelize.col('speedType'), { [Op.not]: speedTypeSlowest }),
  });

  return hyperCntGet && hyperCntGet.length > 0 ? hyperCntGet[0].count : 0;
}

// * instead for mysql func Fn_Get_ChargerCnt_Slow
async function slowChargerCounter(chargingStationId, speedTypeSlowest) {
  const lowCntGet = await models.ChargerModel.count({
    include: [
      {
        model: models.sb_charger,
        as: 'chargers',
        attributes: [],
        where: {
          chgs_id: chargingStationId,
        },
      },
    ],
    group: ['id', 'speedType'],
    having: models.sequelize.where(models.sequelize.col('speedType'), speedTypeSlowest),
  });

  return lowCntGet && lowCntGet.length ? lowCntGet[0].count : 0;
}

// * instead for mysql func Fn_Get_Station_PNC_Cnt
async function pncChargerStationCounter(chargingStationId) {
  const pcnChargerStation = await models.ChargerModel.count({
    include: [
      {
        model: models.sb_charger,
        as: 'chargers',
        attributes: [],
        where: {
          chgs_id: chargingStationId,
        },
      },
    ],
    group: ['id', 'pncAvailable'],
    having: models.sequelize.where(models.sequelize.col('pncAvailable'), true),
  });

  return pcnChargerStation && pcnChargerStation.length ? pcnChargerStation[0].count : 0;
}

// * instead for mysql func Fn_Get_Now_Price_Charger
async function getDivCodePrice(divCode) {
  const configDB = await models.Config.findOne({
    where: {
      divCode,
    },
  });
  return configDB.cfgVal || 0;
}

async function getUnitPriceCharger(charger) {
  const usePreset = charger.usePreset || 'N';
  const upSetId = charger.upSetId || 0;

  if (usePreset === 'Y' && upSetId) {
    const timePrice = await models.sequelize.raw(
      `SELECT TTD.price
        FROM UPSetDetails SD
        JOIN UPTimeTableDetails TTD ON TTD.upTImeTableId = SD.upTimeTableId
        WHERE SD.upSetId = ${upSetId}
        AND NOW() BETWEEN  SD.fromDate  AND SD.toDate
        AND TTD.baseTime = HOUR(NOW());`
    );

    return timePrice[0][0] || 0;
  }

  if (!charger || !charger.chg_charger_id) {
    const DIV_CODE = 'DEFAULT_UNITPRICE';
    return await getDivCodePrice(DIV_CODE);
  }

  return charger.chg_unit_price || 0;
}

module.exports = {
  readChargingStationById,
};
