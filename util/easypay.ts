import { Request, Response, NextFunction } from 'express';
import iconv from 'iconv-lite';
import { parse as parseContentType } from 'content-type';
import { parse as parseQueryString } from 'qs';

export enum EasyPayErrorType {
  FAILED_TO_PREREGISTER_CREDIT,
  FAILED_TO_REGISTER_CREDIT,
}

export class EasyPayError {
  public constructor(type: EasyPayErrorType, message: string | undefined) {
    this.type = type;
    this.message = message;
  }

  public toJSON() {
    switch (this.type) {
      case EasyPayErrorType.FAILED_TO_PREREGISTER_CREDIT:
        return 'failed to preregister credit';
      case EasyPayErrorType.FAILED_TO_REGISTER_CREDIT:
        return 'failed to register credit';
    }
  }

  public type: EasyPayErrorType;
  public message: string | undefined;
}

export enum EasyPayStatusCode {
  /** Good, consider other codes not good state */
  N0000 = '0000',
}

/**
 * POST /api/trades/webpay
 */
export type EasyPayPreregisterRequest = {
  mallId: string;
  payMethodTypeCode: string;
  currency: string;
  amount: number;
  clientTypeCode: string;
  returnUrl: string;
  shopOrderNo: string;
  deviceTypeCode: string;
  orderInfo: {
    goodsName: string;
  };
  payMethodInfo?: {
    billKeyMethodInfo?: {
      certType?: string;
    };
  };
  shopValueInfo?: {
    value1?: string;
  };
};

/** POST /api/trades/webpay */
export type EasyPayPreregisterResponse = {
  resCd: EasyPayStatusCode;
  resMsg: string;
  /** presents only preregister has succeeded */
  authPageUrl?: string;
};

/** POST /v1/paymethod/register */
export type EasyPayPreregisterResultRequest = {
  resCd: EasyPayStatusCode;
  resMsg: string;
  shopOrderNo?: string;
  authorizationId?: string;
};

/** POST /api/trades/approval */
export type EasyPayRegisterRequest = {
  mallId: string;
  shopTransactionId: string;
  authorizationId: string;
  shopOrderNo: string;
  approvalReqDate: string;
};

/**
 * POST /api/trades/approval
 * Defined fields ARE NOT exhaustive list of response field
 * please consult documentation
 */
export type EasyPayRegisterResponse = {
  resCd: string;
  resMsg: string;
  paymentInfo?: {
    cardInfo?: {
      /** billing key */
      cardNo?: string;
      /** credit issuer code */
      issuerCode?: string;
      /** human readable credit issuer name */
      issuerName?: string;
      /** credit purchaser code */
      acquirerCode?: string;
      /** human readable credit purchaser name */
      acquirerName?: string;
      /** partial cancellation availability  */
      partCancelUsed?: string;
      /** masked card number */
      cardMaskNo?: string;
    };
  };
};

/*
 * This code is copied from gist, pay him some respect smh
 * https://gist.github.com/boutdemousse/aca9010952e98ce2a4088a5dca261deb
 */

const toHex = (n: string) => parseInt('0x' + n);

const decodeEuckrUrlToUTF8 = (str = '') =>
  str.replace(/(%([^%]{2}))+/g, (chars) => {
    const b = Buffer.from(chars.split('%').slice(1).map(toHex));
    return iconv.decode(b, 'EUC-KR');
  });

export async function fixEucKr(req: Request, _res: Response, next: NextFunction) {
  if (!req.headers['content-type']) {
    next();
    return;
  }

  const contentType = parseContentType(req.headers['content-type']);
  if (contentType.type != 'application/x-www-form-urlencoded') {
    next();
    return;
  }

  const charset: string = contentType.parameters['charset'] ?? 'utf-8';
  if (charset.toLowerCase() !== 'euc-kr') {
    console.log("!!! 노티 euc-kr이라 next로 넘겼음")
    next();
    return;
  }

  req.headers['content-type'] = 'x-damn-it-kicc';

  const raw = await new Promise<string>((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      resolve(decodeEuckrUrlToUTF8(raw));
    });
    req.on('error', (error) => {
      reject(error);
    });
  });

  const body = parseQueryString(raw, { charset: 'utf-8' });
  req.body = body;

  next();
  return;
}
