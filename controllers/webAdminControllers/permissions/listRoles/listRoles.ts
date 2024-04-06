import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODE, PERMISSIONS } from '../../../../middleware/newRole.middleware';
import { PERMISSION_NAME } from '../../../../util/permission.constraints';
import { Op } from 'sequelize';
import { USER_TYPE } from '../../../../util/tokenService';
const models = require('../../../../models');

type PermissionMap = {
  name: PERMISSION_NAME;
  rules: {
    list: boolean;
    read: boolean;
    write: boolean;
    delete: boolean;
  };
};

type PermissionCate = {
  name: string;
  permissions: PermissionMap[];
};

type RoleResponse = {
  id: string;
  name: string;
  mainMenu: string;
  systemSetting: PermissionCate;
  belong: PermissionCate;
  userManagement: PermissionCate;
  charger: PermissionCate;
  history: PermissionCate;
  gift: PermissionCate;
  settlement: PermissionCate;
  notice: PermissionCate;
  cs: PermissionCate;
  consultation: PermissionCate;
  chargingLogs: PermissionCate;
  dashBoard: PermissionCate;
};

export const listRoles = {
  path: '/web/auth/roles',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [PERMISSIONS.read],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request: Request, response: Response, next: NextFunction) {
  const name = request.query.name?.toString() || '';
  const { page, limit } = transformRequest(request);
  const offset = (page - 1) * limit;

  let whereInput = {};
  if (name) {
    whereInput = {
      name: {
        [Op.like]: `%${name}%`,
      },
    };
  }

  const { count: totalCount, rows: roles } = await models.Role.findAndCountAll({
    offset,
    limit,
    where: whereInput,
    order: [['createdAt', 'DESC']],
  });

  const roleRes = roles.map((item: any) => transformResponse(item));

  return response.status(HTTP_STATUS_CODE.OK).json({
    totalCount,
    result: roleRes,
  });
}

async function validator(request: Request, response: Response, next: NextFunction) {
  next();
}

async function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  next();
}

const transformRequest = (request: Request): { page: number; limit: number } => {
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

export const transformResponse = (role: any): RoleResponse => {
  const systemSetting = [
    PERMISSION_NAME.codeLookUp,
    PERMISSION_NAME.parameter,
    PERMISSION_NAME.errorCode,
    PERMISSION_NAME.chargerModel,
    PERMISSION_NAME.updateFile,
    PERMISSION_NAME.permissionSetting,
  ];
  const systemSettingPermissions: PermissionMap[] = [];

  const belong = [PERMISSION_NAME.station, PERMISSION_NAME.contractor, PERMISSION_NAME.client];
  const belongPermission: PermissionMap[] = [];

  const userManagement = [PERMISSION_NAME.mobileUser, PERMISSION_NAME.hdoUser, PERMISSION_NAME.externalUser];
  const userManagementPermission: PermissionMap[] = [];

  const charger = [
    PERMISSION_NAME.chargingStation,
    PERMISSION_NAME.charger,
    PERMISSION_NAME.chargingUnitPrice,
    PERMISSION_NAME.chargerUpdate,
    PERMISSION_NAME.troubleReport,
  ];
  const chargerPermission: PermissionMap[] = [];

  const history = [
    PERMISSION_NAME.chargerHistory,
    PERMISSION_NAME.reservation,
    PERMISSION_NAME.paymentHistory,
    PERMISSION_NAME.unExportedPayment,
    PERMISSION_NAME.paymentDetails,
    PERMISSION_NAME.outstandingPayment,
    PERMISSION_NAME.chargerHistory,
  ];
  const historyPermission: PermissionMap[] = [];

  const gift = [
    PERMISSION_NAME.bonusCard,
    PERMISSION_NAME.point,
    PERMISSION_NAME.carWash,
    PERMISSION_NAME.coupon,
    // PERMISSION_NAME.addServiceStats,
  ];
  const giftPermission: PermissionMap[] = [];

  const notice = [
    PERMISSION_NAME.noticePopup,
    PERMISSION_NAME.notion,
    PERMISSION_NAME.faq,
    PERMISSION_NAME.bannerEvent,
    PERMISSION_NAME.termsPolicy,
    PERMISSION_NAME.inquiry,
    PERMISSION_NAME.review,
  ];
  const noticePermission: PermissionMap[] = [];

  const cs = [
    PERMISSION_NAME.csMain,
    PERMISSION_NAME.template,
    PERMISSION_NAME.csDashboard,
    PERMISSION_NAME.statistics,
  ];
  const csPermission: PermissionMap[] = [];

  const consultation = [PERMISSION_NAME.consultation];
  const consultationPermission: PermissionMap[] = [];

  const settlement = [PERMISSION_NAME.settlement, PERMISSION_NAME.dailyPayment, PERMISSION_NAME.monthlySettlement];
  const settlementPermission: PermissionMap[] = [];

  const chargingLogs = [
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
  ];
  const chargingLogsPermission: PermissionMap[] = [];

  const dashBoard = [PERMISSION_NAME.dashBoard];
  const dashBoardPermission: PermissionMap[] = [];

  const permissionName = Object.values(PERMISSION_NAME);
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
