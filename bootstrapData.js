const models = require('./models');
const { PasswordService } = require('./util/passwordService');
const { idGenerator } = require('./util/idGenerator');
const { USER_ROLE } = require('./middleware/role.middleware');
const { PERMISSION_NAME } = require('./util/permission.constraints');

const bootstrapData = async (config) => {
  const { defaultAdminAccountId } = config;

  try {
    await models.sequelize.transaction(async (t) => {
      const HDO_ORG_ID = 2;
      const HDO_ORG_CATE = 'HDO';
      const DEF_ORG_ID = 1;
      const DEF_ORG_CATE = 'DEF';
      const hdoOrg = await seedOrg(HDO_ORG_ID, HDO_ORG_CATE, t);
      const mobileOrg = await seedOrg(DEF_ORG_ID, DEF_ORG_CATE, t);
      const role = await seedRoleForAdminUser(t);

      // First, need to sync UsersNew model avoid Unknown column Error
      // when API_MODE=true and UsersNew model added new column.
      await models.UsersNew.sync({alter:true})

      const hasAdmin = await models.UsersNew.findOne({
        where: {
          accountId: defaultAdminAccountId,
        },
        include: [
          {
            model: models.Role,
            as: 'Role',
          },
        ],
      });
      if (!hasAdmin) {
        await seedAdminUser(config, hdoOrg.id, role.id, t);
      }
    });
    // await models.CsLog.sync({ alter: true });
    console.log('seed data successfully');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const seedOrg = async (orgId, orgCate, transaction) => {
  const hdoOrg = await models.Org.findByPk(orgId);
  if (!hdoOrg) {
    const hdoOrgCreated = await models.Org.create(
      {
        id: orgId,
        category: orgCate,
        deductType: 'NONE',
        discountPrice: 0,
        staticUnitPrice: 0,
        isPayLater: false,
        isLocked: false,
        closed: false,
        haveCarWash: 'N',
      },
      { transaction }
    );

    return hdoOrgCreated;
  }
  return hdoOrg;
};

const seedAdminUser = async (config, orgId, roleId, transaction) => {
  const { defaultAdminAccountId, defaultAdminEmail, defaultAdminPassword } = config;
  const passwordService = new PasswordService(config);
  const { salt, passwordHashed } = await passwordService.hash(defaultAdminPassword);

  const user = await models.UsersNew.create(
    {
      accountId: defaultAdminAccountId,
      email: defaultAdminEmail,
      isEmailVerified: true,
      type: USER_ROLE.HDO,
      saltRounds: salt,
      hashPassword: passwordHashed,
      name: 'HDO supper admin',
      orgId,
      roleId,
    },
    { transaction }
  );

  return user;
};

const seedRoleForAdminUser = async (transaction) => {
  const id = idGenerator();
  const hasRole = await models.Role.findOne({
    name: 'supper admin',
  });

  if (!hasRole) {
    const roleAdminUser = await models.Role.create(
      {
        id,
        name: 'supper admin',
        listPermission: Object.values(PERMISSION_NAME),
        readPermission: Object.values(PERMISSION_NAME),
        writePermission: Object.values(PERMISSION_NAME),
        deletePermission: Object.values(PERMISSION_NAME),
      },
      { transaction }
    );

    return roleAdminUser;
  }

  return hasRole;
};

module.exports = { bootstrapData };
