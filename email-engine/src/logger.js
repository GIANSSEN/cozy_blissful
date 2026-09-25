import pino from 'pino';
import { config } from './config.js';

const logger = config.logging.pretty
  ? pino({
      level: config.logging.level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      },
      base: {
        service: 'cozy-blissful-email-engine'
      }
    })
  : pino({
      level: config.logging.level,
      base: {
        service: 'cozy-blissful-email-engine'
      }
    });

export { logger };

export function createChildLogger(context) {
  return logger.child(context);
}