import type { Request, Response, NextFunction } from 'express';
import { BaseError as SequelizeError, Transaction } from 'sequelize';
import { v5 as uuid } from 'uuid';

// @ts-ignore
import { sequelize } from '../../models';

import {
  EasyPayPreregisterResultRequest,
  EasyPayStatusCode,
  EasyPayError,
  EasyPayErrorType,
  EasyPayRegisterRequest,
  EasyPayRegisterResponse,
} from '../../util/easypay';
import { easypayMallId, easypayApiHost } from './config';

// @ts-ignore
import { USER_ROLE } from '../../middleware/role.middleware';
import { ServiceDefinition } from './preregister-credit';
// @ts-ignore
import models, { BankCard } from '../../models';
import axios from 'axios';
import { USER_TYPE } from '../../util/tokenService';

const _service: ServiceDefinition = {
  path: ['/paymethod/register'],
  method: 'post',
  checkToken: true,
  roles: [USER_TYPE.MOBILE],
  service,
  validator,
  errorHandler,
};
export default _service;

/**
 * generate UUID to be used as transaction ID for EasyPay API
 * It uses UUID v5 (namespace based with SHA1) using RFC URL namespace.
 * Username + delimiter + timestamp are supplied as input.
 */
function generateEasyPayUUID(userId: string, time: Date): string {
  const delimiter: string = '\x00';
  time.setSeconds(0);
  time.setMilliseconds(0);
  return uuid(userId + delimiter + time.toISOString(), uuid.URL);
}

async function requestRegister(body: EasyPayRegisterRequest, userId: string): Promise<EasyPayRegisterResponse> {
  const method = 'POST';
  const url = easypayApiHost + '/api/trades/approval';
  const headers = { 'Content-Type': 'application/json', Charset: 'utf-8' };
  const second = 1000;

  const response = await axios({ url, headers, method, data: body, timeout: 30 * second });
  const responseBody = response.data;
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
    throw new EasyPayError(EasyPayErrorType.FAILED_TO_REGISTER_CREDIT, responseBody.resMsg);
  }

  return responseBody;
}

/**
 * POST /payment/register
 */
async function service(req: Request, res: Response, _: NextFunction) {
  const { user: authUser, url } = req;
  const body: EasyPayPreregisterResultRequest = req.body;

  try {
    if (body.resCd != EasyPayStatusCode.N0000) {
      throw new EasyPayError(EasyPayErrorType.FAILED_TO_PREREGISTER_CREDIT, body.resMsg);
    }

    const now = new Date();

    /**
     * TODO EasyPay API expects clients to request abort if it fails somehow, but
     * it does not. It might invol DB operation but DB is
     * undocumented-messy-crap-hell for now, I'm doubt I can implement it in the
     * right way.
     */
    const registerResponse = await requestRegister(
      {
        mallId: easypayMallId,
        shopTransactionId: generateEasyPayUUID(req.user.id, now),
        authorizationId: body.authorizationId as string,
        shopOrderNo: body.shopOrderNo as string,
        approvalReqDate: formatApprovalDate(new Date()),
      },
      authUser.id
    );

    const MAX_CARD_PER_USER = 5;
    const { count, rows: cards } = await BankCard.findAndCountAll({ where: { userId: req.user.id } });

    if (count >= MAX_CARD_PER_USER) {
      return res.render('register-credit-result.ejs', {
        result: 'fail',
        message: '이미 5개 카드가 등록되었습니다. 카드 등록 위해서 삭제 먼저해주세요.',
      });
    }

    const cardNo = registerResponse.paymentInfo?.cardInfo?.cardMaskNo
      ? registerResponse.paymentInfo.cardInfo.cardMaskNo.toString()
      : '';
    const cardIssuer = registerResponse.paymentInfo?.cardInfo?.issuerName
      ? registerResponse.paymentInfo.cardInfo.issuerName.toString()
      : '';

    const [existsCardNo, existsCardIssuer] = cards.reduce(
      (cardInfo: [string[], string[]], currentItem: any) => {
        const [existsCardNo, existsCardIssuer] = cardInfo;

        existsCardNo.push(currentItem.cardNo);
        existsCardIssuer.push(currentItem.cardIssuer);

        return [existsCardNo, existsCardIssuer];
      },
      [[], []]
    );

    const isExistsCardNo = existsCardNo.includes(cardNo);
    const isExistsCardIssuer = existsCardIssuer.includes(cardIssuer);
    if (isExistsCardNo && isExistsCardIssuer) {
      return res.render('register-credit-result.ejs', {
        result: 'fail',
        message: '이미 등록된 카드입니다.',
      });
    }

    const paymethod = {
      userId: req.user.id,
      updatedAt: now,
      createdWho: req.user.id,
      updatedWho: req.user.id,
      cardNo: registerResponse.paymentInfo?.cardInfo?.cardMaskNo as string,
      billingKey: registerResponse.paymentInfo?.cardInfo?.cardNo as string,
      cardBrand: registerResponse.paymentInfo?.cardInfo?.acquirerName as string,
      cardIssuer: registerResponse.paymentInfo?.cardInfo?.issuerName as string,
    };
    await BankCard.create(paymethod);

    res.render('register-credit-result.ejs', { result: 'success', message: '' });
  } catch (error) {
    // TODO replace console.log

    // DB error
    if (error instanceof SequelizeError) {
      console.log('an error occured while operating DB');
      console.log(error);
      res.status(500);
      return;
    }

    // EasyPay API error
    if (error instanceof EasyPayError) {
      if (error.type == EasyPayErrorType.FAILED_TO_REGISTER_CREDIT) {
        console.log('EasyPay API rejected credit registe request');
        console.log('message: ', error.message);
      } else {
        console.log('an error occured while registering credit');
        console.log(error);
      }
      const payload = {
        result: 'fail',
        message: error.message,
      };
      res.status(400);
      res.render('register-credit-result.ejs', payload);
      return;
    }

    console.log('an unknown error occured while registering credit');
    console.log(error);
    res.status(500);
    return;
  }
}

function validator(_arg0: Request, _arg1: Response, next: NextFunction) {
  next();
}

function errorHandler(error: any, _arg1: Request, res: Response, _arg3: NextFunction) {
  console.log('an exception has thrown during processing POST /payment/register');
  console.log(error);
  res.status(500);
  const payload = { result: 'failed', message: 'server error' };
  res.render('register-credit-result.ejs', payload);
  return;
}

function formatApprovalDate(date: Date): string {
  const yyyy = date.getFullYear().toString();
  const mm = date.getMonth().toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return yyyy + mm + dd;
}
