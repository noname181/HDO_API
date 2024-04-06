import TransportStream, { TransportStreamOptions } from 'winston-transport';
import { idGenerator } from '../../util/idGenerator';
import { IConfig, configuration } from '../../config/config';
const models = require('../../models');

export class TransportLogging extends TransportStream {
  private config: IConfig;

  constructor(private opts: TransportStreamOptions) {
    super(opts);
    this.config = configuration();
  }

  async log(info: any, next: () => void) {
    const { timestamp, ...meta } = info.metadata;
    const metadata = JSON.stringify(meta);
    if (this.config.nodeEnv !== 'dev') {
      try {
        const id = idGenerator();
        await models.Logging.create({
          id,
          timestamp,
          level: info.level,
          message: info.message,
          info: metadata,
        });
      } catch (error) {
        console.error('TransportLogging::log::', error);
        next();
      }
    }

    next();
  }
}
