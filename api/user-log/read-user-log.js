'use strict';
const models = require('../../models');
const { USER_ROLE } = require('../../middleware/role.middleware');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { PERMISSIONS } = require('../../middleware/newRole.middleware');
const { PERMISSION_NAME } = require('../../util/permission.constraints');
const { USER_TYPE } = require('../../util/tokenService');
const {
  userIdMask,
  nameMask,
  emailMask,
} = require('../../controllers/webAdminControllers/user/transformAdminUser/transformAdminUser');

module.exports = {
  path: ['/web/userslog-list'],
  method: 'get',
  checkToken: true, // default true
  roles: [USER_TYPE.MOBILE, USER_TYPE.EXTERNAL, USER_TYPE.HDO],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(_request, _response, next) {
  const pageNum = _request.query.page ? parseInt(_request.query.page) : 1;
  const rowPerPage = _request.query.rpp ? parseInt(_request.query.rpp) : 50;
  const odby = _request.query.odby ? _request.query.odby.toUpperCase() : 'DESC';
  const startDate = _request.query.startDate || null;
  const endDate = _request.query.endDate || null;
  const select = _request.query.searchKey ? _request.query.searchKey.toUpperCase() : 'ALL';
  let searchWord = _request.query.searchVal || null;
  const status = _request.query.devision;
  const type = _request.query.type ? _request.query.type.toUpperCase() : 'ALL';

  const whereQuery = {
    [Op.and]: [{}],
  };

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    whereQuery[Op.and].push({
      createdAt: {
        [Op.between]: [start, end],
      },
    });
  } else if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    whereQuery[Op.and].push({
      createdAt: {
        [Op.gte]: start,
      },
    });
  } else if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    whereQuery[Op.and].push({
      createdAt: {
        [Op.lte]: end,
      },
    });
  }

  if (searchWord) {
    if (select === 'ID') {
      whereQuery[Op.and].push({ '$UsersNew.accountId$': { [Op.like]: `%${searchWord}%` } });
    }
    if (select === 'NAME') {
      whereQuery[Op.and].push({ '$UsersNew.name$': { [Op.like]: `%${searchWord}%` } });
    }
    if (select === 'IP') {
      whereQuery[Op.and].push({ ipAddress: { [Op.like]: '%' + searchWord + '%' } });
    }
    if (select === 'ALL') {
      whereQuery[Op.and].push({
        [Op.or]: [
          {
            ipAddress: { [Op.like]: `%${searchWord}%` },
          },
          { '$UsersNew.name$': { [Op.like]: `%${searchWord}%` } },
          { '$UsersNew.email$': { [Op.like]: `%${searchWord}%` } },
          { '$UsersNew.accountId$': { [Op.like]: `${searchWord}` } },
        ],
      });
    }
  }

  if (status) {
    whereQuery[Op.and].push({ status });
  }

  if (type !== 'ALL') {
    whereQuery[Op.and].push({ '$UsersNew.type$': type });
  }

  let options = {
    where: whereQuery,
    include: [
      {
        model: models.UsersNew,
        as: 'UsersNew',
        attributes: ['accountId', 'email', 'name', 'type'],
        include: [
          {
            model: models.Org,
            attributes: ['category', 'name', 'id', 'fullname', 'address'],
          },
          {
            model: models.SAP_Person,
            attributes: ['JKW1', 'ORG1', 'PHONE2'],
          },
        ],
      },
    ],
    attributes: {
      exclude: ['createdWho', 'updatedWho', 'deletedAt'],
    },
    order: [['createdAt', odby]],
    offset: (pageNum - 1) * rowPerPage,
    limit: rowPerPage,
  };

  try {
    const { count: totalCount, rows: userLog } = await models.UserLogs.findAndCountAll(options);

    const result = userLog.map((value) => {
      return {
        id: value?.id,
        status: value?.status,
        ipAddress: value?.ipAddress,
        failedLoginNumber: value?.failedLoginNumber,
        note: value?.note,
        details: value?.details,
        urlPage: value?.urlPage,
        createdAt: value?.createdAt,
        updatedAt: value?.updatedAt,
        userId: value?.userId,
        UsersNew: {
          name: nameMask(value?.UsersNew?.name ?? ''),
          accountId: userIdMask(value?.UsersNew?.accountId ?? ''),
          email: emailMask(value?.UsersNew?.email ?? ''),
          type: value?.UsersNew.type,
        },
        Org: value?.UsersNew?.Org
          ? {
              details: value?.UsersNew?.Org.category,
              name: value?.UsersNew?.Org.name,
              fullname: value?.UsersNew?.Org.fullname,
              address: value?.UsersNew?.Org.address,
              id: value?.UsersNew?.Org.id,
            }
          : null,
        Person: value?.UsersNew?.SAP_Person
          ? {
              JKW1: value?.UsersNew?.SAP_Person.JKW1 || '',
              ORG1: value?.UsersNew?.SAP_Person.ORG1 || '',
              PHONE2: value?.UsersNew?.SAP_Person.PHONE2 || '',
            }
          : null,
      };
    });

    // 조회된 사용자 목록 응답
    _response.json({
      status: '200',
      totalCount: totalCount,
      result: result,
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
