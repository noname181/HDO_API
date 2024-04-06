"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundStationException = void 0;
const newRole_middleware_1 = require("../../middleware/newRole.middleware");
const http_exception_1 = require("../http.exception");
class NotFoundStationException extends http_exception_1.HttpException {
    constructor() {
        super(newRole_middleware_1.HTTP_STATUS_CODE.NOT_FOUND, '해당 ID에 대한 충전소가 존재하지 않습니다.', 'NOT_EXIST_CHARGING_STATION');
    }
}
exports.NotFoundStationException = NotFoundStationException;
