/* eslint-disable no-console */
const log = require('loglevel');

module.exports = ({ level = 'warn', logger } = {}) => {
  const levels = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];

  if (level == null || level === '') {
    // eslint-disable-next-line no-param-reassign
    level = 'warn';
  }

  if (levels.indexOf(level) === -1) {
    console.error('invalid log level: %s', level);
  }
  log.setLevel(level);
  // if logger passed in, call logger functions instead of our loglevel functions
  if (logger != null) {
    levels.forEach(loggerLevel => {
      if (typeof logger[loggerLevel] === 'function') {
        log[loggerLevel] = (...args) => {
          logger[loggerLevel](...args);
        };
      }
    });
  }

  return log;
};
