import log from 'loglevel';

enum LogLevel {
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'silent',
}

type LogLevelStrings = keyof typeof LogLevel;

type Logger = Record<Exclude<LogLevelStrings, 'silent'>, log.LoggingMethod>;

export default function logger({
  level = 'warn',
  // eslint-disable-next-line no-shadow
  logger,
}: { level?: LogLevelStrings; logger?: Logger } = {}): log.RootLogger {
  const levels: Exclude<LogLevelStrings, 'silent'>[] = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
  ];

  log.setLevel(level);

  // if logger passed in, call logger functions instead of our loglevel functions
  if (logger !== undefined) {
    levels.forEach((loggerLevel: Exclude<LogLevelStrings, 'silent'>) => {
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
