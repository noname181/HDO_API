"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLogFile = exports.dailyLog = void 0;
const model = require('../../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const fs = __importStar(require("fs"));
const config_1 = require("../../config/config");
const uploadService_1 = require("../uploadService/uploadService");
const dailyLog = (previousDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logData = yield model.UserLogs.findAll({
            where: {
                createdAt: { [Op.like]: `%${previousDate}%` },
            },
        });
        const filePath = `./logger/${previousDate}.json`;
        yield Promise.all(logData.map((record) => __awaiter(void 0, void 0, void 0, function* () {
            yield fs.appendFileSync(filePath, JSON.stringify(record.dataValues) + '\n', 'utf-8');
        })));
    }
    catch (error) {
        console.log('error: ', error);
    }
});
exports.dailyLog = dailyLog;
const uploadLogFile = (previousDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = (0, config_1.configuration)();
        const uploadService = new uploadService_1.UploadService(config);
        yield uploadService.uploadLogFile(previousDate);
    }
    catch (error) {
        console.log('error: ', error);
    }
});
exports.uploadLogFile = uploadLogFile;
