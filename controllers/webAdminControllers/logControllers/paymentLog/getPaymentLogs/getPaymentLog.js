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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPaymentLogResponse = exports.getPaymentLog = void 0;
const tokenService_1 = require("../../../../../util/tokenService");
const logType_enum_1 = require("../../logType.enum");
const sequelize_1 = require("sequelize");
const transformDate_1 = require("../../../../../util/transformDate");
const transformAdminUser_1 = require("../../../user/transformAdminUser/transformAdminUser");
const models = require('../../../../../models');
exports.getPaymentLog = {
    path: '/admin/logs/payments',
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [],
    service: service,
};
function service(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = transformQuery(request);
        const queryDb = buildQueryDb(query);
        try {
            if (query.page && query.rpp) {
                const offset = (query.page - 1) * query.rpp;
                const { count: totalCount, rows: dbPaymentLogs } = yield models.AllLogs.findAndCountAll({
                    offset,
                    limit: query.rpp,
                    where: {
                        [sequelize_1.Op.and]: queryDb,
                    },
                    include: [
                        {
                            model: models.UsersNew,
                            as: 'user',
                            attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
                        },
                    ],
                    order: [['createdAt', 'DESC']],
                });
                const paymentLogs = dbPaymentLogs.map((item) => item.get({ plain: true }));
                const result = paymentLogs.map((item) => (0, exports.transformPaymentLogResponse)(item));
                return response.status(200).json({ totalCount, result });
            }
            const { count: totalCount, rows: dbPaymentLogs } = yield models.AllLogs.findAndCountAll({
                where: {},
                include: [
                    {
                        model: models.UsersNew,
                        as: 'users',
                        attributes: ['id', 'accountId', 'name', 'email', 'orgId'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });
            const paymentLogs = dbPaymentLogs.map((item) => item.get({ plain: true }));
            const result = paymentLogs.map((item) => (0, exports.transformPaymentLogResponse)(item));
            return response.status(200).json({ totalCount, result });
        }
        catch (error) {
            console.log('🚀 ~ service ~ error:', error);
            return response.status(200).json({ totalCount: 0, result: [] });
        }
    });
}
const transformQuery = (request) => {
    const { query } = request;
    const page = query.page && !Array.isArray(query.page) ? Number(query.page.toString()) : 0;
    const rpp = query.rpp && !Array.isArray(query.rpp) ? Number(query.rpp.toString()) : 50;
    const searchKey = query.searchKey && !Array.isArray(query.searchKey) ? query.searchKey.toString() : '';
    const searchVal = query.searchVal && !Array.isArray(query.searchVal) ? query.searchVal.toString() : '';
    const startTime = query.startTime && !Array.isArray(query.startTime) ? query.startTime.toString() : '';
    const endTime = query.endTime && !Array.isArray(query.endTime) ? query.endTime.toString() : '';
    return {
        page,
        rpp,
        searchKey,
        searchVal,
        startTime,
        endTime,
    };
};
const buildQueryDb = (query) => {
    const queryDb = [
        {
            type: logType_enum_1.LOG_TYPE.PAYMENT,
        },
    ];
    const startTime = (0, transformDate_1.transformDate)(query.startTime);
    if (startTime) {
        const date = new Date(startTime);
        queryDb.push({
            createdAt: { [sequelize_1.Op.gte]: date },
        });
    }
    const endTime = (0, transformDate_1.transformDate)(query.endTime);
    if (endTime) {
        const date = new Date(endTime);
        queryDb.push({
            createdAt: { [sequelize_1.Op.lte]: date },
        });
    }
    if (!query.searchVal) {
        return queryDb;
    }
    const searchQuery = searchKeyQueryDb(query.searchVal, query.searchKey);
    queryDb.push({ searchQuery });
    return queryDb;
};
const searchKeyQueryDb = (searchVal, searchKey) => {
    const keys = {
        url: {
            [sequelize_1.Op.like]: `%${searchVal}%`,
        },
        content: {
            [sequelize_1.Op.like]: `%${searchVal}%`,
        },
        level: {
            [sequelize_1.Op.like]: `%${searchVal}%`,
        },
    };
    if (!searchKey) {
        const queryDb = [];
        for (const key in keys) {
            console.log('key::', key);
            queryDb.push({ key: keys[key] });
        }
        return queryDb;
    }
    return keys[searchKey] || keys.content;
};
const transformPaymentLogResponse = (paymentLog, isPrivateView = true) => {
    const { user } = paymentLog, data = __rest(paymentLog, ["user"]);
    return Object.assign(Object.assign({}, data), { user: user
            ? {
                id: user.id,
                accountId: isPrivateView ? (0, transformAdminUser_1.userIdMask)(user.accountId) : user.accountId,
                name: isPrivateView ? (0, transformAdminUser_1.nameMask)(user.name) : user.name,
                email: isPrivateView ? (0, transformAdminUser_1.emailMask)(user.email) : user.email,
                orgId: user.orgId,
            }
            : null });
};
exports.transformPaymentLogResponse = transformPaymentLogResponse;
