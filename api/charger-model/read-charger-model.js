/**
 * Created by Inju on 2023-06-08.
 * 충전기 모델 조회 API
 */
'use strict';
const models = require('../../models');
const sequelize = require('sequelize');
const { USER_ROLE } = require('../../middleware/role.middleware');
const { USER_TYPE } = require('../../util/tokenService');
const Op = sequelize.Op;
module.exports = {
  path: ['/charger-model'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(req, res, next) {
  try {
    const { manufacturerId, contype, speedtype } = req.query;

    const pageNum = req.query.page ? parseInt(req.query.page) : 0;
    const rowPerPage = req.query.rpp ? parseInt(req.query.rpp) : 50;
    const orderBy = req.query.odby ? req.query.odby.toUpperCase() : 'DESC';

    const select = req.query.select ? req.query.select.toUpperCase() : 'ALL';
    let searchWord = req.query.search || null;
    if (searchWord == '초고속' && (select == 'ALL' || select == 'SPEEDTYPE')) {
      searchWord = '1';
    } else if (searchWord == '급속' && (select == 'ALL' || select == 'SPEEDTYPE')) {
      searchWord = '2';
    } else if (searchWord == '중속' && (select == 'ALL' || select == 'SPEEDTYPE')) {
      searchWord = '3';
    } else if (searchWord == '완속' && (select == 'ALL' || select == 'SPEEDTYPE')) {
      searchWord = '4';
    }
    const queryOptions = {
      where: {
        deletedAt: null,
      },
      attributes: [
        'id',
        'modelCode',
        'manufacturerId',
        [
          sequelize.literal(
            '(SELECT descInfo FROM CodeLookUps WHERE divCode = "MANUFACT" AND descVal = ChargerModel.manufacturerId LIMIT 1)'
          ),
          'manufacturerName',
        ],
        'modelName',
        'maxKw',
        'speedType',
        'connectorType',
        'channelCount',
        'lastFirmwareVer',
        'pncAvailable',
        'useYN',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'createdWho',
        'updatedWho',
      ],
      offset: pageNum * rowPerPage,
      limit: rowPerPage,
      order: [['id', orderBy]],
    };

    if (manufacturerId) {
      queryOptions.where.manufacturerId = manufacturerId;
    }

    if (req.query.startDate && req.query.endDate) {
      const start = new Date(req.query.startDate);
      const end = new Date(req.query.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      queryOptions.where.createdAt = { [Op.between]: [start, end] };
    } else if (req.query.startDate) {
      const start = new Date(req.query.startDate);
      start.setHours(0, 0, 0, 0);
      queryOptions.where.createdAt = { [Op.gte]: start };
    } else if (req.query.endDate) {
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      queryOptions.where.createdAt = { [Op.lte]: end };
    }

    // modelName이 있는 경우만 추가
    if (searchWord) {
      if (select === 'ALL') {
        const manufacturerNameCondition = sequelize.literal(
          '(SELECT descInfo FROM CodeLookUps WHERE divCode = "MANUFACT" AND descVal = ChargerModel.manufacturerId)'
        );

        queryOptions.where[Op.or] = [
          { modelCode: { [Op.like]: `%${searchWord}%` } },
          { manufacturerId: { [Op.like]: `%${searchWord}%` } },
          { modelName: { [Op.like]: `%${searchWord}%` } },
          { maxKw: { [Op.like]: `%${searchWord}%` } },
          { speedType: { [Op.like]: `%${searchWord}%` } },
          { channelCount: { [Op.like]: `%${searchWord}%` } },
          { connectorType: { [Op.like]: `%${searchWord}%` } },
          {
            [Op.and]: [
              sequelize.where(manufacturerNameCondition, 'LIKE', `%${searchWord}%`),
              sequelize.where(manufacturerNameCondition, { [Op.not]: null }),
            ],
          },
        ];
      }
      if (select == 'MODELNAME') {
        queryOptions.where[Op.or] = [{ modelName: { [Op.like]: `%${searchWord}%` } }];
      }
      if (select == 'MODELCODE') {
        queryOptions.where[Op.or] = [{ modelCode: { [Op.like]: `%${searchWord}%` } }];
      }
      if (select == 'MANUFACTURERID') {
        queryOptions.where[Op.or] = [{ manufacturerId: { [Op.like]: `%${searchWord}%` } }];
      }
      if (select == 'MAXKW') {
        queryOptions.where[Op.or] = [{ maxKw: { [Op.like]: `%${searchWord}%` } }];
      }
      if (select == 'SPEEDTYPE') {
        queryOptions.where[Op.or] = [{ speedType: { [Op.like]: `%${searchWord}%` } }];
      }
      if (select == 'CHANNELCOUNT') {
        queryOptions.where[Op.or] = [{ channelCount: { [Op.like]: `%${searchWord}%` } }];
      }
      if (select == 'CONNECTORTYPE') {
        queryOptions.where[Op.or] = [{ connectorType: { [Op.like]: `%${searchWord}%` } }];
      }
      if (select == 'MANUFACTURERNAME') {
        const manufacturerNameCondition = sequelize.literal(
          '(SELECT descInfo FROM CodeLookUps WHERE divCode = "MANUFACT" AND descVal = ChargerModel.manufacturerId)'
        );
        queryOptions.where[Op.or] = [
          {
            [Op.and]: [
              sequelize.where(manufacturerNameCondition, 'LIKE', `%${searchWord}%`),
              sequelize.where(manufacturerNameCondition, { [Op.not]: null }),
            ],
          },
        ];
      }
    }

    queryOptions.where[Op.and] = [];
    if (contype) {
      queryOptions.where[Op.and].push({ connectorType: contype });
    }
    if (speedtype) {
      queryOptions.where[Op.and].push({ speedType: speedtype });
    }

    // 쿼리 실행
    const { count: totalCount, rows: chargerModels } = await models.ChargerModel.findAndCountAll(queryOptions);

    // for (const item of chargerModels) {
    //   if (item.lastFirmwareVer === null) {
    //     const lastFirmwareVer = await models.ChargerModelFW.findOne({ where: { isLast: true }, attributes: ['fwVer'] });
    //     item.lastFirmwareVer = lastFirmwareVer.fwVer;
    //   }
    // }

    res.json({ totalCount: totalCount, result: chargerModels });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  _response.error.unknown(_error.toString());
  next(_error);
}
