import { Request, Response } from 'express';
import { USER_TYPE } from '../../../../../util/tokenService';
import { Op } from 'sequelize';
import { LOG_TYPE } from '../../logType.enum';
import { NotFoundException } from '../../../../../exceptions/notFound/notFound.exception';
import { transformPaymentLogResponse } from '../getPaymentLogs/getPaymentLog';

const models = require('../../../../../models');

export const getPaymentLogById = {
  path: '/admin/logs/payments/:id',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [],
  service: service,
};

async function service(request: Request, response: Response) {
  const { params } = request;
  const id = Number(params.id) || 0;

  const dbPaymentLog = await models.AllLogs.findOne({
    where: {
      [Op.and]: [
        {
          id,
        },
        {
          type: LOG_TYPE.PAYMENT,
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
    throw new NotFoundException('Payment log is not found', 'NOT_FOUND');
  }

  const paymentLog = dbPaymentLog.get({ plain: true });
  const result = transformPaymentLogResponse(paymentLog, false);

  return response.status(200).json(result);
}
