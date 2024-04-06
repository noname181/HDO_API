import { IConfig, configuration } from '../../../config/config';
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  DescribeQueriesCommand,
  FilterLogEventsCommand,
  GetLogEventsCommand,
  OutputLogEvent,
} from '@aws-sdk/client-cloudwatch-logs';
import { UnavailableException } from '../../../exceptions/unavailable/unavailable.exception';
import { NotFoundException } from '../../../exceptions/notFound/notFound.exception';

export class CloudWatchService {
  private config: IConfig;
  private client: CloudWatchLogsClient;
  private logGroupName: string;

  constructor() {
    this.config = configuration();
    this.client = new CloudWatchLogsClient({
      region: this.config.awsRegion
    });
    this.logGroupName = '/aws/containerinsights/hdo-test2/application';
  }

  async getLogStreamName(nextToken?: string): Promise<{ logStreamName: string[]; nextToken?: string }> {
    const LIMIT_LOG_STREAM = 1;
    try {
      const command = new DescribeLogStreamsCommand({
        logGroupName: this.logGroupName,
        logStreamNamePrefix:
          'ip-192-168-44-67.ap-northeast-2.compute.internal-application.var.log.containers.hdoev-api-total',
        nextToken,
        limit: LIMIT_LOG_STREAM,
      });

      const data = await this.client.send(command);

      if (!data || !data.logStreams || data.logStreams.length === 0) {
        return {
          logStreamName: [],
          nextToken: data.nextToken,
        };
      }

      const result = data.logStreams.map((item) => item.logStreamName);
      return {
        logStreamName: result.filter((item): item is string => !!item),
        nextToken: data.nextToken,
      };
    } catch (error) {
      console.log('error::', error);
      return {
        logStreamName: [],
      };
    }
  }

  async getLogFromGroupName(nextToken?: string): Promise<{ data: OutputLogEvent[]; nextToken?: string }> {
    const logStreams = await this.getLogStreamName(nextToken);

    const data = await Promise.all(
      logStreams.logStreamName.map(async (item) => {
        try {
          const command = new GetLogEventsCommand({
            logGroupName: this.logGroupName,
            logStreamName: item,
            startFromHead: true,
          });

          const data = await this.client.send(command);

          if (!data || !data.events || data.events.length === 0) {
            return [];
          }
          const result = data.events.map((item) => item);
          return result;
        } catch (error) {
          console.log('error::', error);
          return [];
        }
      })
    );

    return {
      data: data.flat(),
      nextToken: logStreams.nextToken,
    };
  }

  logDataTransform(data: OutputLogEvent) {
    return {
      createdAt: data.timestamp ? new Date(data.timestamp).toISOString() : '',
      data: data.message ? JSON.parse(data.message) : {},
    };
  }
}
