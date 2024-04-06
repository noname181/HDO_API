if (!process.env.EASYPAY_MALL_ID) throw new Error('EASYPAY_MALL_ID is not set');
if (!process.env.EASYPAY_RETURN_URL) throw new Error('EASYPAY_RETURN_URL is not set');
if (!process.env.EASYPAY_API_HOST) throw new Error('EASYPAY_API_HOST is not set');

/** EasyPay API Mall ID key */
const easypayMallId: string = process.env.EASYPAY_MALL_ID;
/**
 * EasyPay card preregister process return URL
 * This must point to credit register HTTP API, see EasyPay billkey documenetation
 */
const easypayReturnUrl: string = process.env.EASYPAY_RETURN_URL;
/** EasyPay API host address */
const easypayApiHost: string = process.env.EASYPAY_API_HOST;

export { easypayMallId, easypayReturnUrl, easypayApiHost };
