'use strict';

module.exports = function ({level, logger}) {
  let levels = ['trace', 'debug', 'info', 'warn', 'error'];
  let log = require('loglevel');

  level = level || 'warn';
  if (!levels.includes(level)) { console.error('invalid log level: %s', level); }
  log.setLevel(level);

  // if logger passed in, call logger functions instead of our loglevel functions
  if (logger != null && typeof logger === 'object') {
    levels.forEach((level) => {
      if (typeof logger[level] === 'function') {
        log[level] = (...args) => { logger[level](...args); };
      }
    });
  }

  return log;
};
