import { Transaction } from 'sequelize';
import { configuration } from '../../../../config/config';
import { PasswordService } from '../../../../util/passwordService';
import { TokenService, USER_TYPE } from '../../../../util/tokenService';

const models = require('../../../../models');
const { USER_STATUS } = require('../loginByAccountId/loginByAccountId');

export type MobileAccountPayload = {
  accountId: string;
  password: string;
  email: string;
  phoneNumber: string;
  userName?: string;
  dupinfo?: string;
  birth?: string;
  gender?: string;
  address?: string;
  detailAddress?: string;
  zipCode?: string;
  status?: string;
};

export const createMobileAccount = async (payload: MobileAccountPayload) => {
  const config = configuration();
  const passwordService = new PasswordService(config);
  const {
    accountId,
    password,
    email,
    phoneNumber,
    userName,
    dupinfo,
    birth,
    gender,
    address,
    detailAddress,
    zipCode,
    status,
  } = payload;

  try {
    return await models.sequelize.transaction(async (t: Transaction) => {
      const { salt, passwordHashed } = await passwordService.hash(password);

      let accountCreateInput = {
        accountId,
        name: userName || accountId,
        saltRounds: salt,
        hashPassword: passwordHashed,
        dept: 'mobile',
        status: status || USER_STATUS.active,
        // TODO should change to false when implement send verify email function
        idEmailVerified: true,
        phoneNo: phoneNumber,
        email,
        // ! shouldn't hard code for orgId. need check if DB is exists that record
        orgId: 1,
        dupinfo,
        birth,
        gender,
        address,
        detailAddress,
        zipCode,
      };  
      
        return await models.UsersNew.create(accountCreateInput, {
          include: [
            {
              model: models.Org,
              foreignKey: 'orgId',
              attributes: { exclude: ['deletedAt'] },
            },
            {
              model: models.Vehicle,
              foreignKey: 'usersNewId',
              attributes: { exclude: ['deletedAt'] },
              as: 'vehicles',
            },
            {
              model: models.PayMethod,
              foreignKey: 'usersNewId',
              attributes: { exclude: ['deletedAt'] },
              as: 'payMethods',
            },
          ],
          transaction: t,
        });
    
    });
  } catch (error) {
    console.log('error::', error);

    return 'ERROR_REGISTER';
  }
};
 