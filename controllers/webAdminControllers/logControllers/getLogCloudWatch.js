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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogCloudWatch = void 0;
const tokenService_1 = require("../../../util/tokenService");
const newRole_middleware_1 = require("../../../middleware/newRole.middleware");
const cloudWatch_service_1 = require("./cloudWatch.service");
exports.getLogCloudWatch = {
    path: '/admin/logs/cloudwatch',
    method: 'get',
    checkToken: true,
    roles: [tokenService_1.USER_TYPE.HDO, tokenService_1.USER_TYPE.EXTERNAL],
    permissions: [],
    service: service,
};
function service(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = queryTypeTransform(request);
        const cloudwatchService = new cloudWatch_service_1.CloudWatchService();
        const logData = yield cloudwatchService.getLogFromGroupName(query.nextToken);
        const result = logData.data.map((item) => cloudwatchService.logDataTransform(item));
        return response.status(newRole_middleware_1.HTTP_STATUS_CODE.OK).json({
            totalCount: result.length,
            result,
            nextToken: logData.nextToken,
        });
    });
}
const queryTypeTransform = (req) => {
    const { query } = req;
    const startTime = query.startTime && query.startTime.toString();
    const endTime = query.endTime && query.endTime.toString();
    const nextToken = query.nextToken && query.nextToken.toString();
    return {
        startTime: startTime && !isNaN(new Date(startTime).getTime()) ? startTime : '',
        endTime: endTime && !isNaN(new Date(endTime).getTime()) ? endTime : '',
        nextToken,
    };
};
