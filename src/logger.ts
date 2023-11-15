import loglevel from 'loglevel';

import { isDefinedAndNotNull } from './utils';

export type LogLevelMethodNames = 'debug' | 'info' | 'warn' | 'error';

export type Logger = Record<LogLevelMethodNames, loglevel.LoggingMethod>;

let loggerId = 0;

export default function logger({
  // eslint-disable-next-line @typescript-eslint/no-shadow
  logger,
  level,
}: { logger?: Logger; level?: loglevel.LogLevelDesc } = {}): Logger {
  const levels: LogLevelMethodNames[] = ['debug', 'info', 'warn', 'error'];

  const loglevelLogger = loglevel.getLogger(String((loggerId += 1)));

  if (isDefinedAndNotNull(level)) loglevelLogger.setLevel(level);

  const log = {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
    debug: (...msg: any[]): void => {
      loglevelLogger.debug(...msg);
    },
    info: (...msg: any[]): void => {
      loglevelLogger.info(...msg);
    },
    warn: (...msg: any[]): void => {
      loglevelLogger.warn(...msg);
    },
    error: (...msg: any[]): void => {
      loglevelLogger.error(...msg);
    },
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
  };

  // if logger passed in, call logger functions instead of our loglevel functions
  if (isDefinedAndNotNull(logger)) {
    levels.forEach((loggerLevel) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (logger[loggerLevel] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        log[loggerLevel] = (...msg: any[]): void => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          logger[loggerLevel](...msg);
        };
      }
    });
  }

  return log;
}
