"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_LEVEL = exports.LOG_TYPE = void 0;
var LOG_TYPE;
(function (LOG_TYPE) {
    LOG_TYPE["PAYMENT"] = "PAYMENT";
    LOG_TYPE["USER"] = "USER";
})(LOG_TYPE || (exports.LOG_TYPE = LOG_TYPE = {}));
var LOG_LEVEL;
(function (LOG_LEVEL) {
    LOG_LEVEL["INFO"] = "INFO";
    LOG_LEVEL["ERROR"] = "ERROR";
    LOG_LEVEL["DEBUG"] = "DEBUG";
    LOG_LEVEL["FATAL"] = "FATAL";
    LOG_LEVEL["WARN"] = "WARN";
})(LOG_LEVEL || (exports.LOG_LEVEL = LOG_LEVEL = {}));
