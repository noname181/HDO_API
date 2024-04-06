const models = require('../../../../models');
const { IAuthUser, TokenService, USER_TYPE } = require('../../../../util/tokenService');
const {
  accountIdValidator,
  passwordValidator,
  emailValidator,
  phoneNoTransform,
  phoneNoValidator,
} = require('../../../../util/validators');

async function checkExists(type, condition) {
  const existsUser = await models.UsersNew.count({
    where: {
      type,
      ...condition,
    },
  });
  return existsUser > 0;
}

const validateRegister = async (payload) => {
  const { type, accountId, phoneNumber, email, password } = payload;
  try {
    
    if (!type || !Object.values(USER_TYPE).find((item) => item.toUpperCase() === type)) {
      return 'ERROR_REGISTER';
    }
   

    if (!accountIdValidator(accountId)) {
      return 'INVALID_ACCOUNT_ID';
    } 

    if (!emailValidator(email)) {
      return 'INVALID_EMAIL';
    } 

    const phoneNoNormalize = phoneNoTransform(phoneNumber);
    if (!phoneNoValidator(phoneNoNormalize)) {
      return 'INVALID_PHONE_NUMBER';
    } 

    if (!passwordValidator(password)) {
      return 'INVALID_PASSWORD';
    } 

    const banned = await checkExists(type, { accountId, status: 'BLOCK' });
    if (banned) {
      return 'BLOCK_USER';
    } 

    const checkAccountId = await checkExists(type, { accountId, status: 'ACTIVE' });
    if (checkAccountId) {
      return 'ALREADY_EXIST_USER';
    }
    

    const checkPhoneNo = await checkExists(type, { phoneNo: phoneNoNormalize, status: 'ACTIVE'});
    if (checkPhoneNo) {
      return 'ALREADY_EXIST_PHONE_NUMBER';
    } 

    const checkEmail = await checkExists(type, { email, status: 'ACTIVE' });
    if (checkEmail) {
      return 'ALREADY_EXIST_EMAIL';
    } 

    return false;
  } catch (error) {
    return 'ERROR_REGISTER';
  }
}

exports.validateRegister = validateRegister;
