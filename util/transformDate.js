"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDate = void 0;
const transformDate = (dateInput = '') => {
    const date = new Date(dateInput);
    return !isNaN(date.getTime()) ? date.getTime() : 0;
};
exports.transformDate = transformDate;
