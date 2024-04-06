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
exports.getPaymentLogById = void 0;
const tokenService_1 = require("../../../../../util/tokenService");
const sequelize_1 = require("sequelize");
const logType_enum_1 = require("../../logType.enum");
const notFound_exception_1 = require("../../../../../exceptions/notFound/notFound.exception");
const getPaymentLog_1 = require("../getPaymentLogs/getPaymentLog");
const models = require('../../../../../models');
exports.getPaymentLogById = {
    path: '/admin/logs/payments/:id',
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [],
    service: service,
};
function service(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const { params } = request;
        const id = Number(params.id) || 0;
        const dbPaymentLog = yield models.AllLogs.findOne({
            where: {
                [sequelize_1.Op.and]: [
                    {
                        id,
                    },
                    {
                        type: logType_enum_1.LOG_TYPE.PAYMENT,
                    },
                ],
            },
            include: [
                {
                    model: models.UsersNew,
                    as: 'user',
                    attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
                },
            ],
        });
        if (!dbPaymentLog) {
            throw new notFound_exception_1.NotFoundException('Payment log is not found', 'NOT_FOUND');
        }
        const paymentLog = dbPaymentLog.get({ plain: true });
        const result = (0, getPaymentLog_1.transformPaymentLogResponse)(paymentLog, false);
        return response.status(200).json(result);
    });
}
