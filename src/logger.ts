import loglevel from 'loglevel';

import { isDefinedAndNotNull } from './utils';

type LogLevelMethodNames = 'debug' | 'info' | 'warn' | 'error';

export type Logger = Record<LogLevelMethodNames, loglevel.LoggingMethod>;

let loggerId = 0;

export default function logger({
  // eslint-disable-next-line no-shadow
  logger,
  level,
}: { logger?: Logger; level?: loglevel.LogLevelDesc } = {}): Logger {
  const levels: LogLevelMethodNames[] = ['debug', 'info', 'warn', 'error'];

  const loglevelLogger = loglevel.getLogger(String((loggerId += 1)));

  if (isDefinedAndNotNull(level)) loglevelLogger.setLevel(level);

  const log = {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    debug: (...msg: any[]): void => loglevelLogger.debug(...msg),
    info: (...msg: any[]): void => loglevelLogger.info(...msg),
    warn: (...msg: any[]): void => loglevelLogger.warn(...msg),
    error: (...msg: any[]): void => loglevelLogger.error(...msg),
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  // if logger passed in, call logger functions instead of our loglevel functions
  if (isDefinedAndNotNull(logger)) {
    levels.forEach((loggerLevel: LogLevelMethodNames) => {
      if (logger[loggerLevel] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        log[loggerLevel] = (...msg: any[]): void => logger[loggerLevel](...msg);
      }
    });
  }

  return log;
}
