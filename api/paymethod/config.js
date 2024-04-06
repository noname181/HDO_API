"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.easypayApiHost = exports.easypayReturnUrl = exports.easypayMallId = void 0;
if (!process.env.EASYPAY_MALL_ID)
    throw new Error('EASYPAY_MALL_ID is not set');
if (!process.env.EASYPAY_RETURN_URL)
    throw new Error('EASYPAY_RETURN_URL is not set');
if (!process.env.EASYPAY_API_HOST)
    throw new Error('EASYPAY_API_HOST is not set');
/** EasyPay API Mall ID key */
const easypayMallId = process.env.EASYPAY_MALL_ID;
exports.easypayMallId = easypayMallId;
/**
 * EasyPay card preregister process return URL
 * This must point to credit register HTTP API, see EasyPay billkey documenetation
 */
const easypayReturnUrl = process.env.EASYPAY_RETURN_URL;
exports.easypayReturnUrl = easypayReturnUrl;
/** EasyPay API host address */
const easypayApiHost = process.env.EASYPAY_API_HOST;
exports.easypayApiHost = easypayApiHost;
