import { Request, Response } from 'express';
import { USER_TYPE } from '../../../util/tokenService';
import { HTTP_STATUS_CODE } from '../../../middleware/newRole.middleware';
import { CloudWatchService } from './cloudWatch.service';

type GetLogCloudWatchQuery = {
  startTime?: string;
  endTime?: string;
  nextToken?: string;
};

export const getLogCloudWatch = {
  path: '/admin/logs/cloudwatch',
  method: 'get',
  checkToken: true,
  roles: [USER_TYPE.HDO, USER_TYPE.EXTERNAL],
  permissions: [],
  service: service,
};

async function service(request: Request, response: Response) {
  const query = queryTypeTransform(request);
  const cloudwatchService = new CloudWatchService();
  const logData = await cloudwatchService.getLogFromGroupName(query.nextToken);
  const result = logData.data.map((item) => cloudwatchService.logDataTransform(item));
  return response.status(HTTP_STATUS_CODE.OK).json({
    totalCount: result.length,
    result,
    nextToken: logData.nextToken,
  });
}

const queryTypeTransform = (req: Request): GetLogCloudWatchQuery => {
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
