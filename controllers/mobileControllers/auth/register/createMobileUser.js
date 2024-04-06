"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMobileAccount = void 0;
const config_1 = require("../../../../config/config");
const passwordService_1 = require("../../../../util/passwordService");
const models = require('../../../../models');
const { USER_STATUS } = require('../loginByAccountId/loginByAccountId');
const createMobileAccount = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const config = (0, config_1.configuration)();
    const passwordService = new passwordService_1.PasswordService(config);
    const { accountId, password, email, phoneNumber, userName, dupinfo, birth, gender, address, detailAddress, zipCode, status, } = payload;
    try {
        return yield models.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const { salt, passwordHashed } = yield passwordService.hash(password);
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
            return yield models.UsersNew.create(accountCreateInput, {
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
        }));
    }
    catch (error) {
        console.log('error::', error);
        return 'ERROR_REGISTER';
    }
});
exports.createMobileAccount = createMobileAccount;
