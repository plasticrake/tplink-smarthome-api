'use strict';
/**
 * Represents an error result received from a TP-Link device.
 *
 * Where response err_code != 0.
 * @extends Error
 */
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
