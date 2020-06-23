import log from 'loglevel';

import { isDefinedAndNotNull } from './utils';

type LogLevelMethodNames = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export type Logger = Record<LogLevelMethodNames, log.LoggingMethod>;

export default function logger({
  // eslint-disable-next-line no-shadow
  logger,
}: { logger?: Logger } = {}): log.RootLogger {
  const levels: LogLevelMethodNames[] = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
  ];

  // if logger passed in, call logger functions instead of our loglevel functions
  if (isDefinedAndNotNull(logger)) {
    levels.forEach((loggerLevel: LogLevelMethodNames) => {
      if (logger[loggerLevel] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        log[loggerLevel] = (...msg: any[]): void => {
          logger[loggerLevel](...msg);
        };
      }
    });
  }

  return log;
}
