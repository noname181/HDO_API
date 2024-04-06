const models = require('../../../../models');
const { IAuthUser, TokenService, USER_TYPE } = require('../../../../util/tokenService');
const {
  accountIdValidator,
  passwordValidator,
  emailValidator,
  phoneNoTransform,
  phoneNoValidator,
} = require('../../../../util/validators');
const { USER_STATUS } = require('../../../../controllers/mobileControllers/auth/loginByAccountId/loginByAccountId');

async function checkExists(type, condition) {
    const existsUser = await models.UsersNew.count({
        where: {
        type,
        ...condition,
        },
    });
    return existsUser > 0;
}

async function checkRoleExists(roleId) {
    const role = await models.Role.findByPk(roleId);

    return !!role;
}
  
async function registerForAccountDeleted(userId, status, roleId) {
    await models.UsersNew.update(
      {
        status,
        roleId,
        deletedAt: null,
        createdAt: new Date(),
      },
      { where: { id: userId }, paranoid: false }
    );
  
    const user = await models.UsersNew.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          model: models.Role,
        },
      ], 
      paranoid: false,
    });
  
    return user;
  }


const validateRegister = async (orgId, type, body) => { 
    console.log('orgId:::::', orgId)
    console.log('body:::::', body)

  try {
     
    if (!body) {
        return 'INVALID_PAYLOAD';
    }

    if (!orgId || !type) {
        return 'ERROR_WHILE_CREATE_HDO_ACCOUNT';
    } 

    if (!body.role || !body.accountId) {
        return 'NO_REQUIRED_INPUT';
    }  

    const sapPerson = await models.SAP_Person.findByPk(body.accountId);
    if (!sapPerson || !sapPerson.PASSWORD) {
        return 'ACCOUNT_ID_NOT_EXISTS';
    } 
    const email = sapPerson.EMAIL || body.email;
    const phoneNo = sapPerson.PHONE || body.phoneNo;

   

    if (email && !emailValidator(email)) {
        return 'INVALID_EMAIL';
    }

    if (phoneNo && !phoneNoValidator(phoneNo)) {
        return 'INVALID_PHONE_NUMBER';
    }

    const status = body.status || USER_STATUS.active;
    const checkValidStatus = [USER_STATUS.active, USER_STATUS.block].includes(status.toUpperCase());

    if (!checkValidStatus) {
        return 'INVALID_STATUS';
    }

    const org = await models.Org.findByPk(orgId);
    if (!org) {
        return 'ORG_ID_NOT_EXISTS';
    }

    const isExistsRole = await checkRoleExists(body.role);

    if (!isExistsRole) {
        return 'ROLE_ID_NOT_EXISTS';
    }  

    const banned = await checkExists(type, { accountId: body.accountId, status: 'BLOCK' });
    if (banned) {
      return 'BLOCK_USER';
    } 

    const checkAccountId = await checkExists(type, { accountId: body.accountId, status: 'ACTIVE' });
    if (checkAccountId) {
      return 'ID_ALREADY_REGISTERED';
    }
    

    const checkPhoneNo = await checkExists(type, { phoneNo: phoneNo, status: 'ACTIVE'});
    if (checkPhoneNo) {
      return 'PHONE_NUMBER_ALREADY_REGISTERED';
    } 

    const checkEmail = await checkExists(type, { email: email, status: 'ACTIVE' });
    if (checkEmail) {
      return 'EMAIL_ALREADY_REGISTERED';
    }   

    return false;
  } catch (error) {
    console.log('error::::::', error);
    return 'ERROR_WHILE_CREATE_HDO_ACCOUNT';
  }
}

exports.validateRegister = validateRegister;
