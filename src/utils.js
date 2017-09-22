'use strict';

class ResponseError extends Error {
  constructor (message, response) {
    super(message);
    this.name = 'ResponseError';
    this.message = `${message} response: ${JSON.stringify(response)}`;
    this.response = response;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  ResponseError
};
