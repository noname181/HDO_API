"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportLogging = void 0;
const winston_transport_1 = __importDefault(require("winston-transport"));
const idGenerator_1 = require("../../util/idGenerator");
const config_1 = require("../../config/config");
const models = require('../../models');
class TransportLogging extends winston_transport_1.default {
    constructor(opts) {
        super(opts);
        this.opts = opts;
        this.config = (0, config_1.configuration)();
    }
    log(info, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = info.metadata, { timestamp } = _a, meta = __rest(_a, ["timestamp"]);
            const metadata = JSON.stringify(meta);
            if (this.config.nodeEnv !== 'dev') {
                try {
                    const id = (0, idGenerator_1.idGenerator)();
                    yield models.Logging.create({
                        id,
                        timestamp,
                        level: info.level,
                        message: info.message,
                        info: metadata,
                    });
                }
                catch (error) {
                    console.error('TransportLogging::log::', error);
                    next();
                }
            }
            next();
        });
    }
}
exports.TransportLogging = TransportLogging;
