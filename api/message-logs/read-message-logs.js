'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const {
  emailMask,
  userIdMask,
  nameMask,
  addressMask,
  phoneNoMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');
const { USER_TYPE } = require('../../util/tokenService');
const { Op } = sequelize;
const moment = require('moment');

module.exports = {
  path: ['/messageLogs'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page && _request.query.page > 0 ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const orderByQueryParam = (_request.query.odby ? _request.query.odby : 'DESC').toUpperCase();

  const searchKey = _request.query.searchKey ? _request.query.searchKey : '';
  const searchVal = _request.query.searchVal ? _request.query.searchVal : '';
  const startDate = _request.query.startDate || null;
  const endDate = _request.query.endDate || null;
  const startDateCreate = _request.query.startDateCreate || null;
  const endDateCreate = _request.query.endDateCreate || null;
  const returnType = _request.query.returnType || null;
  const division = _request.query.division ? _request.query.division.toUpperCase() : null;

  const startDateOfMonth = moment().startOf('month').format('YYYY-MM-DD');
  const endDateOfMonth = moment().endOf('month').format('YYYY-MM-DD');
  const messageType = _request.query.messageType || null;

  const where = {
    [Op.and]: [],
  };

  if (startDate || endDate) {
    if (startDate && endDate) {
      where[Op.and].push({ sendDt: { [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59:999`] } });
    } else if (startDate) {
      where[Op.and].push({ sendDt: { [Op.gte]: `${startDate} 00:00:00` } });
    } else if (endDate) {
      where[Op.and].push({ sendDt: { [Op.lte]: `${endDate} 23:59:59:999` } });
    }
  }

  if (startDateCreate || endDateCreate) {
    if (startDateCreate && endDateCreate) {
      where[Op.and].push({
        createdAt: { [Op.between]: [`${startDateCreate} 00:00:00`, `${endDateCreate} 23:59:59:999`] },
      });
    } else if (startDateCreate) {
      where[Op.and].push({ createdAt: { [Op.gte]: `${startDateCreate} 00:00:00` } });
    } else if (endDateCreate) {
      where[Op.and].push({ createdAt: { [Op.lte]: `${endDateCreate} 23:59:59:999` } });
    }
  }

  if (returnType && (returnType === 'F' || returnType === 'S')) {
    where[Op.and].push({ returnType });
  }

  if (messageType) {
    where[Op.and].push({ messageType });
  }
  if (division) {
    if (division.trim() === 'CS') {
      where[Op.and].push({ csId: { [Op.ne]: null } });
    }

    if (division.trim() === 'SYSTEM') {
      where[Op.and].push({ csId: { [Op.eq]: null } });
    }
  }

  const SEARCH_KEY = {
    PHONE_NO: 'phoneNo',
    TEXT_MESSAGE: 'textMessage',
    NAME_ID: 'nameId',
  };

  switch (searchKey) {
    case SEARCH_KEY.PHONE_NO:
      where[Op.and].push({ phoneNo: { [Op.like]: '%' + searchVal + '%' } });
      break;
    case SEARCH_KEY.TEXT_MESSAGE:
      where[Op.and].push({ textMessage: { [Op.like]: '%' + searchVal + '%' } });
      break;
    case SEARCH_KEY.NAME_ID:
      where[Op.and].push({
        [Op.or]: [
          { '$csUser.accountId$': { [Op.like]: '%' + searchVal + '%' } },
          { '$csUser.name$': { [Op.like]: '%' + searchVal + '%' } },
        ],
      });
      break;
    default:
      where[Op.and].push({
        [Op.or]: [
          { phoneNo: { [Op.like]: '%' + searchVal + '%' } },
          { textMessage: { [Op.like]: '%' + searchVal + '%' } },
          { '$csUser.accountId$': { [Op.like]: '%' + searchVal + '%' } },
          { '$csUser.name$': { [Op.like]: '%' + searchVal + '%' } },
        ],
      });
      break;
  }

  try {
    const { count: totalCount, rows: messageLogs } = await models.MessageLog.findAndCountAll({
      where,
      include: [
        {
          model: models.UsersNew,
          as: 'csUser',
          foreignKey: 'csId',
          attributes: ['id', 'accountId', 'name', 'email', 'orgId', 'phoneNo'],
        },
        {
          model: models.sb_charger,
          as: 'charger',
          attributes: { exclude: ['deletedAt'] },
        },
      ],
      attributes: [
        'id',
        'csId',
        'chargerId',
        'textMessage',
        'phoneNo',
        'phoneCaller',
        'sendDt',
        'returnType',
        'messageType',
        'createdAt',
      ],
      offset: (pageNum - 1) * rowPerPage,
      limit: rowPerPage,
      order: [['id', orderByQueryParam]],
    });

    const result = messageLogs.map((value) => {
      return {
        ...value.dataValues,
        phoneNo: phoneNoMask(value?.dataValues?.phoneNo ?? ''),
        csUser: {
          id: value?.csUser?.id,
          name: nameMask(value?.csUser?.name ?? ''),
          accountId: userIdMask(value?.csUser?.accountId ?? ''),
          email: emailMask(value?.csUser?.email ?? ''),
          phoneNo: phoneNoMask(value?.csUser?.phoneNo ?? ''),
          orgId: value?.csUser?.orgId,
        },
      };
    });

    const totalMessageLogsInMonth = await models.MessageLog.count({
      where: {
        createdAt: { [Op.between]: [startDateOfMonth, endDateOfMonth] },
        messageType,
      },
    });

    const totalCSMessageLogsInMonth = await models.MessageLog.count({
      where: {
        createdAt: { [Op.between]: [startDateOfMonth, endDateOfMonth] },
        csId: { [Op.ne]: null },
        messageType,
      },
    });

    const totalSystemMessageLogsInMonth = await models.MessageLog.count({
      where: {
        createdAt: { [Op.between]: [startDateOfMonth, endDateOfMonth] },
        csId: { [Op.eq]: null },
        messageType,
      },
    });

    _response.json({
      totalCount,
      result: result,
      totalMessageLogsInMonth,
      totalCSMessageLogsInMonth,
      totalSystemMessageLogsInMonth,
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

  _response.error.unknown(_error.toString());
  next(_error);
}
