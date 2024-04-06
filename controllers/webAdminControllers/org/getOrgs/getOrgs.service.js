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
exports.getOrgsService = void 0;
const tokenService_1 = require("../../../../util/tokenService");
const newRole_middleware_1 = require("../../../../middleware/newRole.middleware");
const sequelize_1 = require("sequelize");
const transformAdminUser_1 = require("../../user/transformAdminUser/transformAdminUser");
const models = require('../../../../models');
var ORG_CATE;
(function (ORG_CATE) {
    ORG_CATE["station"] = "STATION";
    ORG_CATE["contractor"] = "CONTRACTOR";
    ORG_CATE["client"] = "CLIENT";
})(ORG_CATE || (ORG_CATE = {}));
function getOrgsService(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user: authUser, query } = request;
        const page = Number(query.page) || 1;
        const rpp = Number(query.rpp) || 50;
        const odby = query.odby || 'DESC';
        const user = yield models.UsersNew.findByPk(authUser.id);
        const org = yield models.Org.findByPk(user.orgId);
        if (authUser.type.toLowerCase() === tokenService_1.USER_TYPE.EXTERNAL && (org === null || org === void 0 ? void 0 : org.category) === 'AS') {
            const dbQuery = getOrgsDBQuery(query, org.id);
            const { totalCount, result } = yield getOrgs(dbQuery, page, rpp, odby);
            return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json({ totalCount, result });
        }
        if (authUser.type.toLowerCase() === tokenService_1.USER_TYPE.EXTERNAL && (org === null || org === void 0 ? void 0 : org.category) === 'CS') {
            const dbQuery = getOrgsDBQuery(query, 0, 'CS');
            const { totalCount, result } = yield getOrgs(dbQuery, page, rpp, odby);
            return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json({ totalCount, result });
        }
        const dbQuery = getOrgsDBQuery(query);
        const { totalCount, result } = yield getOrgs(dbQuery, page, rpp, odby);
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json({ totalCount, result });
    });
}
exports.getOrgsService = getOrgsService;
const getOrgs = (dbQuery, page, rpp, odby) => __awaiter(void 0, void 0, void 0, function* () {
    const offset = (page - 1) * rpp;
    let options = {
        where: {
            [sequelize_1.Op.and]: dbQuery,
        },
        attributes: [
            'id',
            'category',
            'fullname',
            'name',
            'bizRegNo',
            'address',
            'contactName',
            'contactPhoneNo',
            'contactEmail',
            'deductType',
            'discountPrice',
            'staticUnitPrice',
            'payMethodId',
            'isPayLater',
            'isLocked',
            'billingDate',
            'closed',
            'area',
            'branch',
            'haveCarWash',
            'haveCVS',
            'STN_STN_SEQ',
            'STN_STN_ID',
            'STN_STN_GUBUN',
            'STN_CUST_NO',
            'STN_ASSGN_AREA_GUBUN',
            'STN_COST_CT',
            'STN_PAL_CT',
            'STN_STN_SHORT_NM',
            'erp',
            'createdAt',
            'updatedAt',
            [
                models.sequelize.literal(`(SELECT descInfo FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)`),
                'branchName',
            ],
            [
                models.sequelize.literal("(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1)"),
                'areaName',
            ],
        ],
        offset,
        limit: rpp,
        order: [['id', odby]],
        include: [
            { model: models.UsersNew, as: 'createdBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
            { model: models.UsersNew, as: 'updatedBy', attributes: ['id', 'accountId', 'name', 'status', 'orgId'] },
            {
                model: models.sb_charging_station,
                as: 'chargingStation',
                attributes: ['chgs_id'],
            },
        ],
    };
    try {
        // 위 조건에 대한 사용자 목록 조회(권한 및 사용자 그룹 포함)
        const { count: totalCount, rows: orgsData } = yield models.Org.findAndCountAll(options);
        const orgs = [];
        for (let item of orgsData) {
            const newItem = Object.assign({}, item.dataValues);
            const privateView = false;
            if (!privateView) {
                const address = (0, transformAdminUser_1.addressMask)(item.address);
                const phoneNo = (0, transformAdminUser_1.phoneNoMask)(item.contactPhoneNo);
                const email = (0, transformAdminUser_1.emailMask)(item.contactEmail);
                const name = (0, transformAdminUser_1.nameMask)(item.contactName);
                newItem.address = address;
                newItem.contactPhoneNo = phoneNo;
                newItem.contactEmail = email;
                newItem.contactName = name;
            }
            orgs.push(Object.assign({}, newItem));
        }
        // 조회된 사용자 목록 응답
        return {
            totalCount: totalCount,
            result: orgs,
        };
    }
    catch (e) {
        console.log('file: getOrgs.service.ts:164 ~ getOrgs ~ e:', e);
        return {
            totalCount: 0,
            result: [],
        };
    }
});
const getOrgsDBQuery = (query, orgId = 0, orgType = '') => {
    var _a;
    const cate = Object.values(ORG_CATE).find((item) => { var _a; return item === ((_a = query.cate) === null || _a === void 0 ? void 0 : _a.toUpperCase()); }) || ORG_CATE.client;
    const area = query.area !== undefined ? parseInt(query.area.toString()) : 0;
    const branch = query.branch !== undefined ? parseInt(query.branch.toString()) : 0;
    const startDate = dateTransformer(query.startDate);
    const endDate = dateTransformer(query.endDate);
    const closed = ((_a = query.closed) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'all';
    const allowSearchKey = [
        'fullname',
        'bizRegNo',
        'address',
        'contactName',
        'contactPhoneNo',
        'contactEmail',
        'deductType',
        'discountPrice',
        'staticUnitPrice',
        'isPayLater',
        'STN_STN_SEQ',
        'STN_STN_ID',
        'STN_STN_GUBUN',
        'STN_CUST_NO',
        'STN_ASSGN_AREA_GUBUN',
        'STN_COST_CT',
        'STN_PAL_CT',
        'STN_STN_SHORT_NM',
    ];
    const cateQuery = cateTransformer(cate);
    const dbQuery = [
        {
            category: {
                [sequelize_1.Op.in]: cateQuery,
            },
        },
    ];
    if (orgId) {
        dbQuery.push({ id: orgId });
    }
    if (orgType && orgType === 'CS') {
        dbQuery.push({ category: 'CS' });
    }
    if (query.name) {
        dbQuery.push({ name: { [sequelize_1.Op.like]: `%${query.name}%` } });
    }
    if (query.contact) {
        dbQuery.push({ contactName: { [sequelize_1.Op.like]: `%${query.contact}%` } });
    }
    if (query.area) {
        dbQuery.push(models.sequelize.literal(`(SELECT upperDivCode FROM CodeLookUps WHERE divCode = 'BRANCH' AND descVal = branch LIMIT 1) = '${query.area}' `));
    }
    if (query.branch !== undefined && !isNaN(branch)) {
        dbQuery.push({ branch });
    }
    if (startDate) {
        dbQuery.push({ createdAt: { [sequelize_1.Op.gte]: startDate } });
    }
    if (endDate) {
        endDate.setUTCHours(23, 59, 59, 999);
        dbQuery.push({ createdAt: { [sequelize_1.Op.lte]: endDate } });
    }
    if (closed === 'true' || closed === 'false') {
        const closedQuery = closedTransformer(closed);
        dbQuery.push({ closed: closedQuery });
    }
    if (query.division) {
        dbQuery.push({ category: query.division });
    }
    if (!query.searchVal) {
        return dbQuery;
    }
    const searchValue = query.searchVal.replace(/-/g, '');
    if (query.searchKey) {
        const searchKeyQuery = searchKeyTransformer(query.searchKey, allowSearchKey);
        dbQuery.push(models.sequelize.where(models.sequelize.fn('REPLACE', models.sequelize.col(searchKeyQuery), '-', ''), 'LIKE', `%${searchValue}%`));
        return dbQuery;
    }
    const searchKeyQuery = searchValQueryBuilder(searchValue, allowSearchKey);
    dbQuery.push({ [sequelize_1.Op.or]: searchKeyQuery });
    return dbQuery;
};
const cateTransformer = (cate) => {
    const cateValue = {
        [ORG_CATE.station]: ['A1', 'X1'],
        [ORG_CATE.contractor]: ['CS', 'AS', 'RF_CARD', 'ETC'],
        [ORG_CATE.client]: ['ALLNC', 'GRP', 'BIZ'],
    };
    return cateValue[cate] || cateValue.CLIENT;
};
const dateTransformer = (date = '') => {
    const newDate = new Date(date);
    if (date && !isNaN(newDate.getTime())) {
        return newDate;
    }
};
const closedTransformer = (closed) => {
    return closed === 'true' ? true : false;
};
const searchKeyTransformer = (searchKey, allowSearchKey) => {
    return allowSearchKey.find((item) => item.toLowerCase() === searchKey.toLowerCase()) || allowSearchKey[0];
};
const searchValQueryBuilder = (searchVal, allowSearchKey) => {
    return allowSearchKey.map((item) => {
        return models.sequelize.where(models.sequelize.fn('REPLACE', models.sequelize.col(`Org.${item}`), '-', ''), 'LIKE', `%${searchVal}%`);
    });
};
