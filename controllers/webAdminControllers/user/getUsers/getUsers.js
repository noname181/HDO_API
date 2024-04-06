const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../../middleware/role.middleware');
const models = require('../../../../models');
const { transformUser } = require('../../../mobileControllers/user/transformUser/transformUser');
const { PERMISSION_NAME } = require('../../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../../middleware/newRole.middleware');
const { transformAdminUser } = require('../transformAdminUser/transformAdminUser');
const { USER_STATUS } = require('../../../mobileControllers/auth/loginByAccountId/loginByAccountId');

const getUsers = {
  path: '/web/users',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.EXTERNAL, USER_TYPE.HDO, USER_TYPE.MOBILE],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

const responseFields = {
  mobile: [
    'id',
    'accountId',
    'email',
    'phoneNo',
    'name',
    'status',
    'type',
    'isEmailVerified',
    'profileImage',
    'birth',
    'gender',
    'address',
    'detailAddress',
    'zipCode',
    'Org.name',
    'payMethods',
    'vehicles',
    'chargingLog',
    'connectedSns',
  ],
  hdo: ['id', 'accountId', 'email', 'phoneNo', 'name', 'status', 'dept', 'role'],
  org: ['id', 'email', 'category', 'name', 'accountId', 'role', 'status', 'phoneNo', 'currentAccessDateTime'],
};

async function service(request, response, next) {
  const { userType, page, rpp } = request.query;

  const usersIncludeDb = [
    {
      model: models.Org,
      attributes: { exclude: ['deletedAt'] },
    },
    {
      model: models.Role,
      foreignKey: 'roleId',
      attributes: { exclude: ['deletedAt'] },
      as: 'Role',
    },
    {
      model: models.SAP_Person,
      attributes: { exclude: ['deletedAt'] },
    },
  ];

  const userTypeQuery =
    Object.values(USER_TYPE).find((item) => item.toUpperCase() === userType.toUpperCase()) || USER_TYPE.MOBILE;

  const queryBuilder = getUserQueryBuilder(request.query);
  const whereClause = {
    [Op.and]: [
      {
        type: userTypeQuery.toUpperCase(),
      },
      ...queryBuilder,
    ],
  };

  if(userTypeQuery.toUpperCase() === 'HDO'){
    whereClause[Op.and].push({
        [Op.or]: [{
          status: {
            [Op.not] : null
          }, 
        },
        {
          roleId: {
            [Op.not] : null
          },
        } 
      ] 
    })
  }
  const paging = parseInt(page) || 1;
  const limit = parseInt(rpp) || 50;
  const offset = (paging - 1) * limit;
  const { count: totalCount, rows: users } = await models.UsersNew.findAndCountAll({
    where: whereClause,
    include: usersIncludeDb,
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  const userRes = users.map((item) => transformAdminUser(item, false));
  return response.status(HTTP_STATUS_CODE.OK).json({
    totalCount,
    result: userRes,
  });
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

const getUserQueryBuilder = (payload) => {
  const { search = '', select = '', status = '', org = '', startDate, endDate, userType } = payload;
  const filterSelectTypes = {
    name: {
      name: { [Op.like]: `%${search}%` },
    },
    email: {
      email: { [Op.like]: `%${search}%` },
    },
    // phone: {
    //   phoneNo: { [Op.like]: `%${search}%` },
    // },
    phone:  userType === 'hdo' ? 
      models.sequelize.literal(`REPLACE(phoneNo, '-', '') LIKE REPLACE('%${search}%', '-', '')`) : 
      {
        phoneNo: { [Op.like]: `%${search}%` },
      },
    accountid: {
      accountId: { [Op.like]: `%${search}%` },
    },
    dept: {
      '$SAP_Person.ORG1$': { [Op.like]: `%${search}%` },
    },
    category: {
      '$Org.category$': { [Op.like]: `%${search}%` },
    },
    orgname: {
      '$Org.name$': { [Op.like]: `%${search}%` },
    },
  }; 
  
  const dateRangeQuery = queryByTimeRange(startDate, endDate);

  const query =
    dateRangeQuery.length === 0
      ? []
      : [
          {
            [Op.and]: dateRangeQuery,
          },
        ];

  if (status) {
    query.push({ status });
  }

  if (org) {
    query.push({ '$Org.category$': `${org}` });
  }

  if (!search) {
    return query;
  }

  if (select) {
    const queryAll = [];
    for (const prop in filterSelectTypes) {
      queryAll.push(filterSelectTypes[prop]);
    }
    const queryBySelect = filterSelectTypes[select.toLowerCase()] || {
      [Op.or]: queryAll,
    };

    query.push(queryBySelect);
  }

  return query;
};

const queryByTimeRange = (start, end) => {
  let queryRangeDate = [];

  if (start) {
    const startDate = new Date(start);
    queryRangeDate.push({
      createdAt: { [Op.gte]: startDate },
    });
  }

  if (end) {
    const endDate = new Date(end);
    endDate.setUTCHours(23, 59, 59, 999);
    queryRangeDate.push({ createdAt: { [Op.lte]: endDate } });
  }

  return queryRangeDate;
};

module.exports = { getUsers, responseFields };
