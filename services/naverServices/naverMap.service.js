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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeoCodeFromAddress = void 0;
const axios_1 = __importDefault(require("axios"));
const getGeoCodeFromAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode-js';
    try {
        const { data } = yield axios_1.default.get(`${url}?query=${address}&X-NCP-APIGW-API-KEY-ID=rb3urd3wxy`);
        if (!data || !data.addresses || !Array.isArray(data.addresses) || data.addresses.length === 0) {
            return {
                longitude: '',
                latitude: '',
            };
        }
        return {
            longitude: data.addresses[0].x || '',
            latitude: data.addresses[0].y || '',
        };
    }
    catch (error) {
        return {
            longitude: '',
            latitude: '',
        };
    }
});
exports.getGeoCodeFromAddress = getGeoCodeFromAddress;
