'use strict';

module.exports = function ({ level, logger }) {
  const levels = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];
  const log = require('loglevel');

  level = level || 'warn';
  if (levels.indexOf(level) === -1) { console.error('invalid log level: %s', level); }
  log.setLevel(level);
  // if logger passed in, call logger functions instead of our loglevel functions
  if (logger != null) {
    levels.forEach((level) => {
      if (typeof logger[level] === 'function') {
        log[level] = (...args) => { logger[level](...args); };
      }
    });
  }

  return log;
};
