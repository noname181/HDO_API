import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE, PERMISSIONS } from '../../../../middleware/newRole.middleware';
import { PERMISSION_NAME } from '../../../../util/permission.constraints';
import { USER_TYPE } from '../../../../util/tokenService';

export const listPermissionPage = {
  path: '/web/auth/permissions',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request: Request, response: Response, next: NextFunction) {
  const listPermission = {
    systemSetting: {
      name: '시스템설정',
      permissions: [
        PERMISSION_NAME.codeLookUp,
        PERMISSION_NAME.parameter,
        PERMISSION_NAME.errorCode,
        PERMISSION_NAME.chargerModel,
        PERMISSION_NAME.updateFile,
        PERMISSION_NAME.permissionSetting,
      ],
    },
    belong: {
      name: '소속',
      permissions: [PERMISSION_NAME.station, PERMISSION_NAME.contractor, PERMISSION_NAME.client],
    },
    userManagement: {
      name: '사용자',
      permissions: [PERMISSION_NAME.mobileUser, PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser],
    },
    charger: {
      name: '충전기',
      permissions: [
        PERMISSION_NAME.chargingStation,
        PERMISSION_NAME.charger,
        PERMISSION_NAME.chargingUnitPrice,
        PERMISSION_NAME.chargerUpdate,
        PERMISSION_NAME.troubleReport,
      ],
    },
    history: {
      name: '내역관리',
      permissions: [
        PERMISSION_NAME.chargerHistory,
        PERMISSION_NAME.reservation,
        PERMISSION_NAME.paymentHistory,
        PERMISSION_NAME.unExportedPayment,
        PERMISSION_NAME.paymentDetails,
        PERMISSION_NAME.outstandingPayment,
      ],
    },
    gift: {
      name: '상품권',
      permissions: [
        PERMISSION_NAME.bonusCard,
        PERMISSION_NAME.point,
        PERMISSION_NAME.carWash,
        PERMISSION_NAME.coupon,
        // PERMISSION_NAME.addServiceStats,
      ],
    },
    settlement: {
      name: '정산',
      permissions: [PERMISSION_NAME.settlement, PERMISSION_NAME.dailyPayment, PERMISSION_NAME.monthlySettlement],
    },
    notice: {
      name: '게시판',
      permissions: [
        PERMISSION_NAME.noticePopup,
        PERMISSION_NAME.notion,
        PERMISSION_NAME.faq,
        PERMISSION_NAME.bannerEvent,
        PERMISSION_NAME.termsPolicy,
        PERMISSION_NAME.inquiry,
        PERMISSION_NAME.review,
      ],
    },
    cs: {
      name: 'CS',
      permissions: [
        PERMISSION_NAME.csMain,
        PERMISSION_NAME.template,
        PERMISSION_NAME.csDashboard,
        PERMISSION_NAME.statistics,
      ],
    },
    consultation: {
      name: 'Consultation',
      permissions: [PERMISSION_NAME.consultation],
    },
    chargingLogs: {
      name: '로그',
      permissions: [
        PERMISSION_NAME.logHistory,
        PERMISSION_NAME.messageLog,
        PERMISSION_NAME.log,
        //PERMISSION_NAME.chargerStatusHistory,
        PERMISSION_NAME.batchLog,
        //PERMISSION_NAME.chargerErrorHistory,
        //PERMISSION_NAME.chargerDiagnostic,
        //PERMISSION_NAME.cloudwatchLog,
        PERMISSION_NAME.chargingLog,
        PERMISSION_NAME.paymentLog,
      ],
    },
    dashBoard: {
      name: '대시보드',
      permissions: [PERMISSION_NAME.dashBoard],
    },
  };

  return response.status(HTTP_STATUS_CODE.OK).json(listPermission);
}

async function validator(request: Request, response: Response, next: NextFunction) {
  next();
}

async function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  next();
}
