import type { Request, Response, NextFunction, Handler, ErrorRequestHandler } from 'express';

import {
  EasyPayErrorType,
  EasyPayError,
  EasyPayStatusCode,
  EasyPayPreregisterResponse,
  EasyPayPreregisterRequest,
} from '../../util/easypay';
import { easypayMallId, easypayReturnUrl, easypayApiHost } from './config';
// @ts-ignore
import { USER_ROLE } from '../../middleware/role.middleware';
import axios from 'axios';
import { USER_TYPE } from '../../util/tokenService';
const models = require('../../models');

const _service: ServiceDefinition = {
  path: ['/paymethod/preregister'],
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.MOBILE],
  service,
  validator,
  errorHandler,
};
export default _service;

async function requestPreregister(
  body: EasyPayPreregisterRequest,
  userId: string
): Promise<EasyPayPreregisterResponse> {
  const method = 'POST';
  const url = easypayApiHost + '/api/trades/webpay';
  const headers = { 'Content-Type': 'application/json' };

  const response = await axios({ url, headers, method, data: body });
  const responseBody: EasyPayPreregisterResponse = response.data;

  try {
    const cardLogData = {
      url,
      content: responseBody,
      userId,
    };
    console.log('preregister credit::requestPreregister::store log::success', responseBody);
    await models.AllLogs.create(cardLogData);
  } catch (err) {
    console.log('preregister credit::requestPreregister::store log::err', err);
  }

  if (response.status >= 400 || responseBody.resCd != EasyPayStatusCode.N0000) {
    throw new EasyPayError(EasyPayErrorType.FAILED_TO_PREREGISTER_CREDIT, responseBody.resMsg);
  }

  return responseBody;
}

/**
 * HandlerDefinition defines what should Express JS handler service package export.
 * TODO this must be moved to somewhere containing common codes.
 */
export interface ServiceDefinition {
  path: string[];
  method: string;
  checkToken: boolean;
  roles: string[];
  service: Handler;
  validator: Handler;
  errorHandler: ErrorRequestHandler;
}

/**
 * GET /payment/preregister
 * query parameters
 * * `shopOrderNo`: unique order number
 * * `deviceTypeCode`: device type, this must be one of `mobile` or `pc`, default is `mobile`
 */
async function service(req: Request, res: Response, _: NextFunction) {
  const { user: authUser, url } = req;
  // shopOrderNo is already validated
  const shopOrderNo = req.query.shopOrderNo as string;
  const deviceTypeCode = req.query.device ?? 'mobile';

  try {
    const preregisterResponse = await requestPreregister(
      {
        mallId: easypayMallId,
        payMethodTypeCode: '81',
        currency: '00',
        clientTypeCode: '00',
        returnUrl: easypayReturnUrl,
        deviceTypeCode: deviceTypeCode as string,
        shopOrderNo: shopOrderNo,
        amount: 0,
        orderInfo: { goodsName: '카드 등록' },
        payMethodInfo: { billKeyMethodInfo: { certType: '0' } },
        shopValueInfo: {
          value1: req.headers['authorization'],
        },
      },
      authUser.id
    );

    res.setHeader('Location', preregisterResponse.authPageUrl as string);
    res.sendStatus(303);
  } catch (error) {
    if (error instanceof EasyPayError) {
      const body = { message: error };
      res.sendStatus(400);
      res.json(body);
      return;
    }
    // TODO replace console.log
    console.log('an error occured while requesting credit preregister');
    console.log(error);
    res.sendStatus(500);
    return;
  }
}

function validator(req: Request, _arg1: Response, next: NextFunction) {
  if (!req.query.shopOrderNo) {
    next('query parameter "shopOrderNo" is missing');
    return;
  }
  next();
}

/** express error handler cannot catch errors from async middleware */
function errorHandler(error: any, _arg1: Request, _arg2: Response, next: NextFunction) {
  return next(error);
}
