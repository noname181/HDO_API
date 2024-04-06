"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const configuration = () => {
    var _a, _b;
    return {
        nodeEnv: process.env.NODE_ENV || 'dev',
        port: Number(process.env.PORT) || 8080,
        salt: Number(process.env.SALT_ROUNDS) || 10,
        jwtAccessTokenKey: process.env.JWT_ACCESS_TOKEN_KEY || 'hdoAccessTokenKey',
        jwtAccessTokenExpireTime: Number(process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME) || 1800,
        jwtRefreshTokenKey: process.env.JWT_REFRESH_TOKEN_KEY || 'hdoRefreshTokenKey',
        jwtRefreshTokenExpireTime: Number(process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME) || 2592000,
        occpKey: process.env.OCCP_SECRET_KEY || '15009502560154084544688180806809',
        ocppServerUrl: process.env.OCPP_URL || 'http://hdo-ecr-evpro-evcs-api-ocpp-service:9999/ocpp/1.6/',
        deeplinkUrl: process.env.DEEPLINK_URL ||
            'https://evnoilbank.page.link/?link=https://evnoilbank.page.link?params={}&apn=com.hdoilbank.evnu.dev',
        defaultAdminAccountId: process.env.DEFAULT_ADMIN_ACCOUNT_ID || 'testhdo1',
        defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'testhdo1@hdo.com',
        defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'Test1234!',
        mailHost: process.env.MAIL_HOST || 'hdo-nlb-prd-mail-proxy-pri-74003ff96d04ea45.elb.ap-northeast-2.amazonaws.com',
        mailPort: Number(process.env.MAIL_PORT) || 25,
        mailUser: (_a = process.env.MAIL_USER) !== null && _a !== void 0 ? _a : '',
        mailPassword: (_b = process.env.MAIL_PASSWORD) !== null && _b !== void 0 ? _b : '',
        mailSender: process.env.MAIL_SENDER || 'no-reply@bp.hd.com',
        webAdminUrl: process.env.WEB_ADMIN_URL || 'https://web.abc7979.net',
        apiServerUrl: process.env.API_SERVER_URL || 'https://api-evnu.oilbank.co.kr',
        awsAccessKey: process.env.AWS_ACCESS_KEY || '',
        awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        awsRegion: process.env.AWS_REGION || 'ap-northeast-2',
        jcoServerUrl: process.env.JCO_URL || 'ws://hdo-ecr-evpro-evcs-wash-service.backend.svc.cluster.local:7778',
    };
};
exports.configuration = configuration;
