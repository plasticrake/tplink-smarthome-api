const Bulb = require('./bulb');
const Device = require('./device');
const Client = require('./client');
const Plug = require('./plug');
const { ResponseError } = require('./utils');

/**
 * @module tplink-smarthome-api
 */
module.exports = {
  Bulb,
  Client,
  Device,
  Plug,
  ResponseError,
};
