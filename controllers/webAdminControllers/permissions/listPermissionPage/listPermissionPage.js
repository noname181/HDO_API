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
exports.listPermissionPage = void 0;
const newRole_middleware_1 = require("../../../../middleware/newRole.middleware");
const permission_constraints_1 = require("../../../../util/permission.constraints");
const tokenService_1 = require("../../../../util/tokenService");
exports.listPermissionPage = {
    path: '/web/auth/permissions',
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [newRole_middleware_1.PERMISSIONS.read],
    service: service,
    validator: validator,
    errorHandler: errorHandler,
};
function service(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const listPermission = {
            systemSetting: {
                name: '시스템설정',
                permissions: [
                    permission_constraints_1.PERMISSION_NAME.codeLookUp,
                    permission_constraints_1.PERMISSION_NAME.parameter,
                    permission_constraints_1.PERMISSION_NAME.errorCode,
                    permission_constraints_1.PERMISSION_NAME.chargerModel,
                    permission_constraints_1.PERMISSION_NAME.updateFile,
                    permission_constraints_1.PERMISSION_NAME.permissionSetting,
                ],
            },
            belong: {
                name: '소속',
                permissions: [permission_constraints_1.PERMISSION_NAME.station, permission_constraints_1.PERMISSION_NAME.contractor, permission_constraints_1.PERMISSION_NAME.client],
            },
            userManagement: {
                name: '사용자',
                permissions: [permission_constraints_1.PERMISSION_NAME.mobileUser, permission_constraints_1.PERMISSION_NAME.hdoUser, permission_constraints_1.PERMISSION_NAME.externalUser],
            },
            charger: {
                name: '충전기',
                permissions: [
                    permission_constraints_1.PERMISSION_NAME.chargingStation,
                    permission_constraints_1.PERMISSION_NAME.charger,
                    permission_constraints_1.PERMISSION_NAME.chargingUnitPrice,
                    permission_constraints_1.PERMISSION_NAME.chargerUpdate,
                    permission_constraints_1.PERMISSION_NAME.troubleReport,
                ],
            },
            history: {
                name: '내역관리',
                permissions: [
                    permission_constraints_1.PERMISSION_NAME.chargerHistory,
                    permission_constraints_1.PERMISSION_NAME.reservation,
                    permission_constraints_1.PERMISSION_NAME.paymentHistory,
                    permission_constraints_1.PERMISSION_NAME.unExportedPayment,
                    permission_constraints_1.PERMISSION_NAME.paymentDetails,
                    permission_constraints_1.PERMISSION_NAME.outstandingPayment,
                ],
            },
            gift: {
                name: '상품권',
                permissions: [
                    permission_constraints_1.PERMISSION_NAME.bonusCard,
                    permission_constraints_1.PERMISSION_NAME.point,
                    permission_constraints_1.PERMISSION_NAME.carWash,
                    permission_constraints_1.PERMISSION_NAME.coupon,
                    // PERMISSION_NAME.addServiceStats,
                ],
            },
            settlement: {
                name: '정산',
                permissions: [permission_constraints_1.PERMISSION_NAME.settlement, permission_constraints_1.PERMISSION_NAME.dailyPayment, permission_constraints_1.PERMISSION_NAME.monthlySettlement],
            },
            notice: {
                name: '게시판',
                permissions: [
                    permission_constraints_1.PERMISSION_NAME.noticePopup,
                    permission_constraints_1.PERMISSION_NAME.notion,
                    permission_constraints_1.PERMISSION_NAME.faq,
                    permission_constraints_1.PERMISSION_NAME.bannerEvent,
                    permission_constraints_1.PERMISSION_NAME.termsPolicy,
                    permission_constraints_1.PERMISSION_NAME.inquiry,
                    permission_constraints_1.PERMISSION_NAME.review,
                ],
            },
            cs: {
                name: 'CS',
                permissions: [
                    permission_constraints_1.PERMISSION_NAME.csMain,
                    permission_constraints_1.PERMISSION_NAME.template,
                    permission_constraints_1.PERMISSION_NAME.csDashboard,
                    permission_constraints_1.PERMISSION_NAME.statistics,
                ],
            },
            consultation: {
                name: 'Consultation',
                permissions: [permission_constraints_1.PERMISSION_NAME.consultation],
            },
            chargingLogs: {
                name: '로그',
                permissions: [
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
                ],
            },
            dashBoard: {
                name: '대시보드',
                permissions: [permission_constraints_1.PERMISSION_NAME.dashBoard],
            },
        };
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json(listPermission);
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
