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
exports.CloudWatchService = void 0;
const config_1 = require("../../../config/config");
const client_cloudwatch_logs_1 = require("@aws-sdk/client-cloudwatch-logs");
class CloudWatchService {
    constructor() {
        this.config = (0, config_1.configuration)();
        this.client = new client_cloudwatch_logs_1.CloudWatchLogsClient({
            region: this.config.awsRegion
        });
        this.logGroupName = '/aws/containerinsights/hdo-test2/application';
    }
    getLogStreamName(nextToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const LIMIT_LOG_STREAM = 1;
            try {
                const command = new client_cloudwatch_logs_1.DescribeLogStreamsCommand({
                    logGroupName: this.logGroupName,
                    logStreamNamePrefix: 'ip-192-168-44-67.ap-northeast-2.compute.internal-application.var.log.containers.hdoev-api-total',
                    nextToken,
                    limit: LIMIT_LOG_STREAM,
                });
                const data = yield this.client.send(command);
                if (!data || !data.logStreams || data.logStreams.length === 0) {
                    return {
                        logStreamName: [],
                        nextToken: data.nextToken,
                    };
                }
                const result = data.logStreams.map((item) => item.logStreamName);
                return {
                    logStreamName: result.filter((item) => !!item),
                    nextToken: data.nextToken,
                };
            }
            catch (error) {
                console.log('error::', error);
                return {
                    logStreamName: [],
                };
            }
        });
    }
    getLogFromGroupName(nextToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const logStreams = yield this.getLogStreamName(nextToken);
            const data = yield Promise.all(logStreams.logStreamName.map((item) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const command = new client_cloudwatch_logs_1.GetLogEventsCommand({
                        logGroupName: this.logGroupName,
                        logStreamName: item,
                        startFromHead: true,
                    });
                    const data = yield this.client.send(command);
                    if (!data || !data.events || data.events.length === 0) {
                        return [];
                    }
                    const result = data.events.map((item) => item);
                    return result;
                }
                catch (error) {
                    console.log('error::', error);
                    return [];
                }
            })));
            return {
                data: data.flat(),
                nextToken: logStreams.nextToken,
            };
        });
    }
    logDataTransform(data) {
        return {
            createdAt: data.timestamp ? new Date(data.timestamp).toISOString() : '',
            data: data.message ? JSON.parse(data.message) : {},
        };
    }
}
exports.CloudWatchService = CloudWatchService;
