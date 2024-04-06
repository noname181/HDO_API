"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneDeep = exports.remove = void 0;
const remove_1 = __importDefault(require("lodash/remove"));
exports.remove = remove_1.default;
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
exports.cloneDeep = cloneDeep_1.default;
