"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const winston_1 = require("winston");
const transportLogging_1 = require("./transportLogging");
class LoggerService {
    constructor() {
        const { timestamp, combine, metadata, printf } = winston_1.format;
        this.logger = (0, winston_1.createLogger)({
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss.ms' }), metadata(), printf((info) => {
                const _a = info.metadata, { timestamp } = _a, meta = __rest(_a, ["timestamp"]);
                const metadata = Object.values(meta).join(' ');
                return `[${timestamp}] [${info.level}] ${info.message} ${metadata}`;
            })),
            transports: [new winston_1.transports.Console(), new transportLogging_1.TransportLogging({})],
        });
    }
    log(message, ...meta) {
        this.logger.info(message, meta);
    }
    warn(message, ...meta) {
        this.logger.warn(message, meta);
    }
    debug(message, ...meta) {
        this.logger.debug(message, meta);
    }
    error(message, ...meta) {
        this.logger.error(message, meta);
    }
}
exports.LoggerService = LoggerService;
