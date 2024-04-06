const { Op } = require('sequelize');
const { USER_ROLE } = require('../../../middleware/role.middleware');
const { USER_TYPE } = require('../../../util/tokenService');
const { HTTP_STATUS_CODE } = require('../../../middleware/role.middleware');
const models = require('../../../models');
const { PERMISSION_NAME } = require('../../../util/permission.constraints');
const { PERMISSIONS } = require('../../../middleware/newRole.middleware');
const { phoneNoMask, userIdMask, emailMask, addressMask } = require('../user/transformAdminUser/transformAdminUser');

const getCustomer = {
  path: '/web/cs-customer',
  method: 'get',
  checkToken: true,
  roles: [PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser, PERMISSION_NAME.mobileUser],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const select = request.query.select ? request.query.select : 'ALL';
  const phoneNo = request.query.phoneNo || null;
  const userId = request.query.userId || null;
  const searchWord = request.query.search || '';
  const id = request.query.id || null;
  let usersQueryDb = [];
  let user = await models.UsersNew.findOne({
    where: { id: userId },
    include: [
      {
        model: models.Org,
        as: 'Org',
      },
    ],
  });

  if (select == 'NAME') {
    usersQueryDb.push({
      [Op.or]: [{ name: { [Op.like]: `%${searchWord}%` } }],
    });
  }
  if (select == 'EMAIL') {
    usersQueryDb.push({
      [Op.or]: [{ email: { [Op.like]: `%${searchWord}%` } }],
    });
  }
  if (select == 'PHONE') {
    usersQueryDb.push({
      [Op.or]: [{ phoneNo: { [Op.like]: `%${searchWord}%` } }],
    });
  }
  if (select == 'ACCOUNTID') {
    usersQueryDb.push({
      [Op.or]: [{ accountId: { [Op.like]: `%${searchWord}%` } }],
    });
  }
  if (select == 'ID') {
    usersQueryDb.push({
      [Op.or]: [{ id: { [Op.like]: `%${searchWord}%` } }],
    });
  }

  if (phoneNo) {
    usersQueryDb.push({
      [Op.or]: [{ phoneNo: phoneNo }],
    });
  }
  if (userId) {
    usersQueryDb.push({
      [Op.or]: [{ accountId: userId }],
    });
  }
  if (id) {
    usersQueryDb.push({
      [Op.or]: [{ id: { [Op.like]: `%${id}%` } }],
    });
  }

  usersQueryDb.push({ type: 'Mobile' });

  usersQueryDb.push({
    [Op.or]: [{ status: 'ACTIVE' }, { status: 'SLEEP' }],
  });

  usersQueryDb.push({});

  let whereClause;

  if (usersQueryDb.length === 1) {
    // 불가능한 검색 조건을 설정
    whereClause = { id: -1 };
  } else {
    whereClause = {
      [Op.and]: usersQueryDb,
    };
  }

  const customers = await models.UsersNew.findAll({
    where: {
      [Op.and]: whereClause,
    },
    include: [
      {
        model: models.Org,
        as: 'Org',
        attributes: ['id', 'category', 'name'],
      },
    ],
  });

  const result = customers.map((value) => {
    return {
      ...value.dataValues,
      accountId:
        user?.Org?.category == 'AS' ? userIdMask(value?.dataValues?.accountId ?? '') : value?.dataValues?.accountId,
      phoneNo: user?.Org?.category == 'AS' ? phoneNoMask(value?.dataValues?.phoneNo ?? '') : value?.dataValues?.phoneNo,
      address: user?.Org?.category == 'AS' ? addressMask(value?.dataValues?.address ?? '') : value?.dataValues?.address,
      email: user?.Org?.category == 'AS' ? emailMask(value?.dataValues?.email ?? '') : value?.dataValues?.email,
    };
  });

  return response.status(HTTP_STATUS_CODE.OK).json(result);
}

function validator(request, response, next) {
  next();
}

function errorHandler(error, request, response, next) {
  next();
}

module.exports = { getCustomer };
