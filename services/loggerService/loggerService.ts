import { Logger, createLogger, format, transports } from 'winston';
import { TransportLogging } from './transportLogging';

export class LoggerService {
  private logger: Logger;

  constructor() {
    const { timestamp, combine, metadata, printf } = format;
    this.logger = createLogger({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.ms' }),
        metadata(),
        printf((info) => {
          const { timestamp, ...meta } = info.metadata;
          const metadata = Object.values(meta).join(' ');
          return `[${timestamp}] [${info.level}] ${info.message} ${metadata}`;
        })
      ),
      transports: [new transports.Console(), new TransportLogging({})],
    });
  }

  log(message: string, ...meta: any[]) {
    this.logger.info(message, meta);
  }

  warn(message: string, ...meta: any[]) {
    this.logger.warn(message, meta);
  }

  debug(message: string, ...meta: any[]) {
    this.logger.debug(message, meta);
  }

  error(message: string, ...meta: any[]) {
    this.logger.error(message, meta);
  }
}
