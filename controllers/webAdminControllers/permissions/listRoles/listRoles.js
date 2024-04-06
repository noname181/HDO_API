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
exports.transformResponse = exports.listRoles = void 0;
const newRole_middleware_1 = require("../../../../middleware/newRole.middleware");
const permission_constraints_1 = require("../../../../util/permission.constraints");
const sequelize_1 = require("sequelize");
const tokenService_1 = require("../../../../util/tokenService");
const models = require('../../../../models');
exports.listRoles = {
    path: '/web/auth/roles',
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [newRole_middleware_1.PERMISSIONS.read],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const name = ((_a = request.query.name) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        const { page, limit } = transformRequest(request);
        const offset = (page - 1) * limit;
        let whereInput = {};
        if (name) {
            whereInput = {
                name: {
                    [sequelize_1.Op.like]: `%${name}%`,
                },
            };
        }
        const { count: totalCount, rows: roles } = yield models.Role.findAndCountAll({
            offset,
            limit,
            where: whereInput,
            order: [['createdAt', 'DESC']],
        });
        const roleRes = roles.map((item) => (0, exports.transformResponse)(item));
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json({
            totalCount,
            result: roleRes,
        });
    });
}
function validator(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        next();
    });
}
function errorHandler(error, request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        next();
    });
}
const transformRequest = (request) => {
    const { query } = request;
    const { page, rpp } = query;
    let paging = 1;
    let limit = 50;
    if (page && !Array.isArray(page) && typeof page === 'string') {
        paging = parseInt(page);
    }
    if (rpp && !Array.isArray(rpp) && typeof rpp === 'string') {
        limit = parseInt(rpp);
    }
    return {
        page: paging,
        limit,
    };
};
const transformResponse = (role) => {
    const systemSetting = [
        permission_constraints_1.PERMISSION_NAME.codeLookUp,
        permission_constraints_1.PERMISSION_NAME.parameter,
        permission_constraints_1.PERMISSION_NAME.errorCode,
        permission_constraints_1.PERMISSION_NAME.chargerModel,
        permission_constraints_1.PERMISSION_NAME.updateFile,
        permission_constraints_1.PERMISSION_NAME.permissionSetting,
    ];
    const systemSettingPermissions = [];
    const belong = [permission_constraints_1.PERMISSION_NAME.station, permission_constraints_1.PERMISSION_NAME.contractor, permission_constraints_1.PERMISSION_NAME.client];
    const belongPermission = [];
    const userManagement = [permission_constraints_1.PERMISSION_NAME.mobileUser, permission_constraints_1.PERMISSION_NAME.hdoUser, permission_constraints_1.PERMISSION_NAME.externalUser];
    const userManagementPermission = [];
    const charger = [
        permission_constraints_1.PERMISSION_NAME.chargingStation,
        permission_constraints_1.PERMISSION_NAME.charger,
        permission_constraints_1.PERMISSION_NAME.chargingUnitPrice,
        permission_constraints_1.PERMISSION_NAME.chargerUpdate,
        permission_constraints_1.PERMISSION_NAME.troubleReport,
    ];
    const chargerPermission = [];
    const history = [
        permission_constraints_1.PERMISSION_NAME.chargerHistory,
        permission_constraints_1.PERMISSION_NAME.reservation,
        permission_constraints_1.PERMISSION_NAME.paymentHistory,
        permission_constraints_1.PERMISSION_NAME.unExportedPayment,
        permission_constraints_1.PERMISSION_NAME.paymentDetails,
        permission_constraints_1.PERMISSION_NAME.outstandingPayment,
        permission_constraints_1.PERMISSION_NAME.chargerHistory,
    ];
    const historyPermission = [];
    const gift = [
        permission_constraints_1.PERMISSION_NAME.bonusCard,
        permission_constraints_1.PERMISSION_NAME.point,
        permission_constraints_1.PERMISSION_NAME.carWash,
        permission_constraints_1.PERMISSION_NAME.coupon,
        // PERMISSION_NAME.addServiceStats,
    ];
    const giftPermission = [];
    const notice = [
        permission_constraints_1.PERMISSION_NAME.noticePopup,
        permission_constraints_1.PERMISSION_NAME.notion,
        permission_constraints_1.PERMISSION_NAME.faq,
        permission_constraints_1.PERMISSION_NAME.bannerEvent,
        permission_constraints_1.PERMISSION_NAME.termsPolicy,
        permission_constraints_1.PERMISSION_NAME.inquiry,
        permission_constraints_1.PERMISSION_NAME.review,
    ];
    const noticePermission = [];
    const cs = [
        permission_constraints_1.PERMISSION_NAME.csMain,
        permission_constraints_1.PERMISSION_NAME.template,
        permission_constraints_1.PERMISSION_NAME.csDashboard,
        permission_constraints_1.PERMISSION_NAME.statistics,
    ];
    const csPermission = [];
    const consultation = [permission_constraints_1.PERMISSION_NAME.consultation];
    const consultationPermission = [];
    const settlement = [permission_constraints_1.PERMISSION_NAME.settlement, permission_constraints_1.PERMISSION_NAME.dailyPayment, permission_constraints_1.PERMISSION_NAME.monthlySettlement];
    const settlementPermission = [];
    const chargingLogs = [
        permission_constraints_1.PERMISSION_NAME.logHistory,
        permission_constraints_1.PERMISSION_NAME.messageLog,
        permission_constraints_1.PERMISSION_NAME.log,
        //PERMISSION_NAME.chargerStatusHistory,
        permission_constraints_1.PERMISSION_NAME.batchLog,
        //PERMISSION_NAME.chargerErrorHistory,
        //PERMISSION_NAME.chargerDiagnostic,
        //PERMISSION_NAME.cloudwatchLog,
        permission_constraints_1.PERMISSION_NAME.chargingLog,
        permission_constraints_1.PERMISSION_NAME.paymentLog,
    ];
    const chargingLogsPermission = [];
    const dashBoard = [permission_constraints_1.PERMISSION_NAME.dashBoard];
    const dashBoardPermission = [];
    const permissionName = Object.values(permission_constraints_1.PERMISSION_NAME);
    for (const item of permissionName) {
        if (systemSetting.includes(item)) {
            systemSettingPermissions.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (belong.includes(item)) {
            belongPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (userManagement.includes(item)) {
            userManagementPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (charger.includes(item)) {
            chargerPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (history.includes(item)) {
            historyPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (gift.includes(item)) {
            giftPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (notice.includes(item)) {
            noticePermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (cs.includes(item)) {
            csPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (consultation.includes(item)) {
            consultationPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (settlement.includes(item)) {
            settlementPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (chargingLogs.includes(item)) {
            chargingLogsPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
        if (dashBoard.includes(item)) {
            dashBoardPermission.push({
                name: item,
                rules: {
                    list: role.listPermission.includes(item),
                    read: role.readPermission.includes(item),
                    write: role.writePermission.includes(item),
                    delete: role.deletePermission.includes(item),
                },
            });
        }
    }
    return {
        id: role.id,
        name: role.name,
        mainMenu: role.mainMenu,
        systemSetting: {
            name: '시스템설정',
            permissions: systemSettingPermissions,
        },
        belong: {
            name: '소속',
            permissions: belongPermission,
        },
        userManagement: {
            name: '사용자',
            permissions: userManagementPermission,
        },
        charger: {
            name: '충전기',
            permissions: chargerPermission,
        },
        history: {
            name: '내역관리',
            permissions: historyPermission,
        },
        gift: {
            name: '상품권',
            permissions: giftPermission,
        },
        settlement: {
            name: '정산',
            permissions: settlementPermission,
        },
        notice: {
            name: '게시판',
            permissions: noticePermission,
        },
        cs: {
            name: 'CS',
            permissions: csPermission,
        },
        consultation: {
            name: 'Consultation',
            permissions: consultationPermission,
        },
        chargingLogs: {
            name: '로그',
            permissions: chargingLogsPermission,
        },
        dashBoard: {
            name: '대시보드',
            permissions: dashBoardPermission,
        },
    };
};
exports.transformResponse = transformResponse;
