import { Request, Response } from 'express';
import { USER_TYPE } from '../../../../../util/tokenService';
import { LOG_TYPE } from '../../logType.enum';
import { Op } from 'sequelize';
import { transformDate } from '../../../../../util/transformDate';
import { emailMask, nameMask, userIdMask } from '../../../user/transformAdminUser/transformAdminUser';

const models = require('../../../../../models');

export const getPaymentLog = {
  path: '/admin/logs/payments',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [],
  service: service,
};

type GetLogQuery = {
  page?: number;
  rpp?: number;
  searchKey?: string;
  searchVal?: string;
  startTime?: string;
  endTime?: string;
};

async function service(request: Request, response: Response) {
  const query = transformQuery(request);
  const queryDb = buildQueryDb(query);

  try {
    if (query.page && query.rpp) {
      const offset = (query.page - 1) * query.rpp;
      const { count: totalCount, rows: dbPaymentLogs } = await models.AllLogs.findAndCountAll({
        offset,
        limit: query.rpp,
        where: {
          [Op.and]: queryDb,
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
      const paymentLogs = dbPaymentLogs.map((item: any) => item.get({ plain: true }));

      const result = paymentLogs.map((item: any) => transformPaymentLogResponse(item));
      return response.status(200).json({ totalCount, result });
    }

    const { count: totalCount, rows: dbPaymentLogs } = await models.AllLogs.findAndCountAll({
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

    const paymentLogs = dbPaymentLogs.map((item: any) => item.get({ plain: true }));

    const result = paymentLogs.map((item: any) => transformPaymentLogResponse(item));
    return response.status(200).json({ totalCount, result });
  } catch (error) {
    console.log('🚀 ~ service ~ error:', error);
    return response.status(200).json({ totalCount: 0, result: [] });
  }
}

const transformQuery = (request: Request): GetLogQuery => {
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

const buildQueryDb = (query: GetLogQuery) => {
  const queryDb: Array<{ [key: string | symbol]: any }> = [
    {
      type: LOG_TYPE.PAYMENT,
    },
  ];

  const startTime = transformDate(query.startTime);
  if (startTime) {
    const date = new Date(startTime);
    queryDb.push({
      createdAt: { [Op.gte]: date },
    });
  }

  const endTime = transformDate(query.endTime);
  if (endTime) {
    const date = new Date(endTime);
    queryDb.push({
      createdAt: { [Op.lte]: date },
    });
  }

  if (!query.searchVal) {
    return queryDb;
  }

  const searchQuery = searchKeyQueryDb(query.searchVal, query.searchKey);
  queryDb.push({ searchQuery });
  return queryDb;
};

const searchKeyQueryDb = (searchVal: string, searchKey?: string) => {
  const keys: Record<string, any> = {
    url: {
      [Op.like]: `%${searchVal}%`,
    },
    content: {
      [Op.like]: `%${searchVal}%`,
    },
    level: {
      [Op.like]: `%${searchVal}%`,
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

export const transformPaymentLogResponse = (paymentLog: any, isPrivateView = true) => {
  const { user, ...data } = paymentLog;
  return {
    ...data,
    user: user
      ? {
          id: user.id,
          accountId: isPrivateView ? userIdMask(user.accountId) : user.accountId,
          name: isPrivateView ? nameMask(user.name) : user.name,
          email: isPrivateView ? emailMask(user.email) : user.email,
          orgId: user.orgId,
        }
      : null,
  };
};
