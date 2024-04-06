"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exceptionAsyncService = void 0;
const exceptionAsyncService = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.exceptionAsyncService = exceptionAsyncService;
